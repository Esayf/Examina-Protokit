import {
    RuntimeModule,
    runtimeModule,
    state,
    runtimeMethod,
} from "@proto-kit/module";
import { StateMap, assert } from "@proto-kit/protocol";
import {
    Field,
    Provable,
    PublicKey,
    Struct,
    Experimental,
    UInt64
} from "o1js";
import { Controller } from "./Controller";
import {
    CalculateScore
} from './ScoreCalculation';
import { UInt240 } from "./UInt240";

await CalculateScore.compile();

class CalculateProof extends Experimental.ZkProgram.Proof(CalculateScore) {}

interface ExamConfig { 
    incorrectToCorrectRatio: Field;
}


export class Question extends Struct({
    questionID: Field,
    questionHash: Field,
    correct_answer: Field,
}) {
    constructor(questionID: Field, questionHash: Field, correct_answer: Field) {
        super({ questionID, questionHash, correct_answer });
        this.questionID = questionID;
        this.correct_answer = correct_answer;
        this.questionHash = questionHash;
    }
}

export class Questions extends Struct ({
    array: Provable.Array(Question, 120)
}) {
    constructor(array: Question[]) {
        super({ array });
        this.array = array;
    }
}
export class UserAnswer extends Struct({
    questionID: Field,
    answer: Field,
}) {
    constructor(questionID: Field, answer: Field) {
        super({ questionID, answer });
        this.questionID = questionID;
        this.answer = answer;
    }
}
export class Exam120 extends Struct({
    questions_count: UInt64,
    creator: PublicKey,
    isActive: UInt64, // 0 = not started, 1 = started, 2 = ended
    questions: Provable.Array(Question, 120),
}) {
    constructor(
        questions_count: UInt64,
        creator: PublicKey,
        isActive: UInt64,
        questions: Question[],
    ) {
        super({ questions_count, creator, isActive, questions});
        this.questions_count = questions_count;
        this.creator = creator;
        this.isActive = isActive;
        for(let i = Number(questions_count.toBigInt()); i < 120; i++) {
            questions[i] = new Question(Field.from(0), Field.from(0), Field.from(0));
        }
        this.questions = questions;
    }
}
export class AnswerID extends Struct({
    examID: Field,
    questionID: Field,
    userID: Field
}) {
    constructor(examID: Field, questionID: Field, userID: Field) {
        super({ examID, questionID, userID });
        this.examID = examID;
        this.questionID = questionID;
        this.userID = userID;
    }
}
@runtimeModule()
export class Examina extends RuntimeModule<ExamConfig> {
    @state() public exams = StateMap.from<Field, Exam120>(Field, Exam120);
    @state() public answers = StateMap.from<AnswerID, UserAnswer>(AnswerID, UserAnswer);

    @runtimeMethod()
    public createExam(examID: Field, exam: Exam120): void {
        this.exams.set(examID, new Exam120(exam.questions_count, exam.creator, UInt64.from(1), exam.questions));
    }

    @runtimeMethod()
    public submitUserAnswer(answerID: AnswerID, answer: UserAnswer): void {
        assert(this.exams.get(answerID.examID).value.isActive.equals(UInt64.from(1)), "Exam is not active");
        this.answers.set(answerID, answer);
    }

    @runtimeMethod()
    public publishExamCorrectAnswers(examID: Field, questions: Questions): void {
        const exam = this.exams.get(examID).value;
        exam.questions = questions.array;
        exam.isActive = UInt64.from(2);
        this.exams.set(examID, exam);
    }

    @runtimeMethod()
    public getUserAnswers(examID: Field, userID: Field): Field[] {
        const exam = this.exams.get(examID).value;
        let userAnswers: Field[] = [];
        for (const question of exam.questions) {
            const answerID = new AnswerID(examID, question.questionID, userID);
            const answer = this.answers.get(answerID);
            userAnswers.push(answer.value.answer);
        }
        return userAnswers;
    }

    @runtimeMethod()
    public checkUserScore(proof: CalculateProof, controller: Controller) {
        proof.verify();
        const incorrectToCorrectRatio = this.config.incorrectToCorrectRatio;

        const secureHash = controller.secureHash;
        proof.publicInput.assertEquals(secureHash);

        secureHash.assertEquals(controller.hash());        

        const incorrects = proof.publicOutput.incorrects;
        const corrects = proof.publicOutput.corrects;
        const quotient = incorrects.div(UInt240.from(incorrectToCorrectRatio.toBigInt()));

        const score = corrects.sub(quotient);

        return score;
    } 
}
