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
    UInt64,
    Poseidon,
    Bool
} from "o1js";

interface ExamConfig { 
    incorrectToCorrectRatio: Field;
}

export class ScoreController extends Struct({
    corrects: Field,
    incorrects: Field
}) {
    constructor(corrects: Field, incorrects: Field) {
        super({ corrects, incorrects });
        this.corrects = corrects;
        this.incorrects = incorrects;
    }

    correct(): ScoreController {
        this.corrects = this.corrects.add(Field.from(1));
        return this;
    }
    incorrect(): ScoreController {
        this.incorrects = this.incorrects.add(Field.from(1));
        return this;
    }
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
    creator: PublicKey,
    isActive: UInt64, // 0 = not started, 1 = started, 2 = ended
    questions: Provable.Array(Question, 120),
}) {
    constructor(
        creator: PublicKey,
        isActive: UInt64,
        questions: Question[],
    ) {
        super({ creator, isActive, questions});
        this.creator = creator;
        this.isActive = isActive;
        this.questions = questions;
    }
}

export class UserExam extends Struct({
    examID: Field,
    userID: Field,
    isCompleted: UInt64
}) {
    constructor(examID: Field, userID: Field, isCompleted: UInt64) {
        super({ examID, userID, isCompleted });
        this.examID = examID;
        this.userID = userID;
        this.isCompleted = isCompleted;
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

    public hash(): Field {
        return Poseidon.hash([this.examID, this.questionID, this.userID]);
    }
}

export class UserAnswerInput extends Struct({
    answerID: AnswerID,
    answer: UserAnswer,
}) {
    constructor(answerID: AnswerID, answer: UserAnswer) {
        super({ answerID, answer });
        this.answer = answer;
        this.answerID = answerID;
    }
}

export class UserAnswersInput extends Struct({
    answers: Provable.Array(UserAnswerInput, 120),
}) {
    constructor(answers: UserAnswerInput[]) {
        super({ answers });
        this.answers = answers;
    }
}
@runtimeModule()
export class Examina extends RuntimeModule<ExamConfig> {
    @state() public exams = StateMap.from<Field, Exam120>(Field, Exam120);
    @state() public answers = StateMap.from<AnswerID, UserAnswer>(AnswerID, UserAnswer);
    @state() public userScores = StateMap.from<UserExam, Field>(UserExam, Field);

    @runtimeMethod()
    public async createExam(examID: Field, exam: Exam120): Promise<void> {
        await this.exams.set(examID, new Exam120(exam.creator, new UInt64(1), exam.questions));
    }

    // Deprecated, will be removed after the backend update
    @runtimeMethod()
    public async submitUserAnswer(answerID: AnswerID, answer: UserAnswer): Promise<void> {
        await this.answers.set(answerID, answer);
    }

    public async submitUserAnswerInternal(answerID: AnswerID, answer: UserAnswer): Promise<void> {

        const exam = (await this.exams.get(answerID.examID));
        assert(exam.isSome, "Exam not found");
        assert(exam.value.isActive.equals(UInt64.from(1)), "Exam is not active");
        await this.answers.set(answerID, answer);
    }

    @runtimeMethod()
    public async submitUserAnswers(answersInput: UserAnswersInput): Promise<void> {
        for(const answer of answersInput.answers) {
            await this.submitUserAnswerInternal(answer.answerID, answer.answer);
        }
    }
    @runtimeMethod()
    public async publishExamCorrectAnswers(examID: Field, questions: Questions): Promise<void> {
        assert((await this.exams.get(examID)).isSome.equals(Bool(true)), "Exam is not available");
        assert((await this.exams.get(examID)).value.isActive.equals(UInt64.from(1)), "Exam is not active");
        let exam = (await this.exams.get(examID)).value;
        exam.questions = questions.array;
        exam.isActive = UInt64.from(2);
        await this.exams.set(examID, exam);
    }

    public async getUserAnswers(examID: Field, userID: Field): Promise<[Field[], Field[]]> {
        const exam = (await this.exams.get(examID)).value;
        let userAnswers: Field[] = [];
        let correctAnswers: Field[] = [];
            for (const question of exam.questions) {
            const answerID = new AnswerID(examID, question.questionID, userID);
            const answer = Provable.if(
                (await this.answers.get(answerID)).isSome, 
                UserAnswer, (await this.answers.get(answerID)).value, 
                new UserAnswer(Field(0), Field(0))
            );
            userAnswers.push(answer.answer);
            correctAnswers.push(question.correct_answer);
        };

        return [correctAnswers, userAnswers];
    }

    public calculateScore(correctAnswers: Field[], userAnswers: Field[]): Field {
        let scoreController = new ScoreController(Field(0), Field(0));
        for (let i = 0; i < correctAnswers.length; i++) {
            const newScore = Provable.if(
            correctAnswers[i].equals(userAnswers[i]).and(correctAnswers[i].equals(Field(0)).not()), 
            ScoreController, 
            new ScoreController(scoreController.corrects.add(Field(1)), scoreController.incorrects) , 
            new ScoreController (scoreController.corrects, scoreController.incorrects.add(Field(1))));
            scoreController = new ScoreController(newScore.corrects, newScore.incorrects);
        }
        return scoreController.corrects;
    }

    @runtimeMethod()
    public async checkUserScore(userID: Field, examID: Field): Promise<void> {
        const [correctAnswers, userAnswers] = await this.getUserAnswers(examID, userID);
        const score = this.calculateScore(correctAnswers, userAnswers);
        await this.userScores.set(new UserExam(examID, userID, UInt64.from(1)), score);
    }
}
