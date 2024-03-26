import {
    RuntimeModule,
    runtimeModule,
    state,
    runtimeMethod,
} from "@proto-kit/module";
import { State, StateMap, assert } from "@proto-kit/protocol";
import {
    Bool,
    Field,
    PrivateKey,
    Provable,
    PublicKey,
    Struct,
    Experimental,
    arrayProp
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
    question: Question,
    answer: Field,
}) {
    constructor(question: Question, answer: Field) {
        super({ question, answer });
        this.question = question;
        this.answer = answer;
    }
}
export class Exam120 extends Struct({
    questions_count: Field,
    creator: PublicKey,
    questions: Provable.Array(Question, 120),
    start_time: Field,
    end_time: Field,
}) {
    constructor(
        questions_count: Field,
        creator: PublicKey,
        questions: Question[],
        start_time: Field,
        end_time: Field
    ) {
        super({ questions_count, creator, questions, start_time, end_time});
        this.questions_count = questions_count;
        this.creator = creator;
        this.questions = questions;
        this.start_time = start_time;
        this.end_time = end_time;
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
    public createExam(examID: Field, Exam: Exam120): void {
        this.exams.set(examID, Exam);
    }

    @runtimeMethod()
    public submitUserAnswer(answerID: AnswerID, answer: UserAnswer): void {
        const start_time = this.exams.get(answerID.examID).value.start_time;
        const end_time = this.exams.get(answerID.examID).value.end_time;
        this.answers.set(answerID, answer);
    }

    @runtimeMethod()
    public publishExamCorrectAnswers(examID: Field, questions: Questions): void {
        const exam = this.exams.get(examID).value;
        exam.questions = questions.array;
        this.exams.set(examID, exam);
    }

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
        const answers = this.getUserAnswers(controller.examID, controller.userID);
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