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
    Poseidon
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
@runtimeModule()
export class Examina extends RuntimeModule<ExamConfig> {
    @state() public exams = StateMap.from<Field, Exam120>(Field, Exam120);
    @state() public answers = StateMap.from<AnswerID, UserAnswer>(AnswerID, UserAnswer);
    @state() public userScores = StateMap.from<UserExam, Field>(UserExam, Field);
    @state() public userExams = StateMap.from<Field, UserExam>(Field, UserExam);
    @runtimeMethod()
    public createExam(examID: Field, exam: Exam120): void {
        this.exams.set(examID, new Exam120(exam.questions_count, exam.creator, UInt64.from(1), exam.questions));
    }

    @runtimeMethod()
    public submitUserAnswer(answerID: AnswerID, answer: UserAnswer): void {
        const userExam = Provable.if(
            this.userExams.get(answerID.userID).value.isCompleted.equals(UInt64.from(0)), 
            UserExam, 
            new UserExam(answerID.examID, answerID.userID, UInt64.from(2)),
            this.userExams.get(answerID.userID).value
        );
        this.userExams.set(answerID.userID, userExam);
        assert(userExam.isCompleted.equals(UInt64.from(1)).not(), "User already completed the exam");
        this.answers.set(answerID, answer);
    }

    @runtimeMethod()
    public publishExamCorrectAnswers(examID: Field, questions: Questions): void {
        const exam = this.exams.get(examID).value;
        exam.questions = questions.array;
        exam.isActive = UInt64.from(2);
        this.exams.set(examID, exam);
    }

    public getUserAnswers(examID: Field, userID: Field): [Field[], Field[]] {
        const exam = this.exams.get(examID).value;
        let userAnswers: Field[] = [];
        let correctAnswers: Field[] = [];
        for (let i = 0; i < exam.questions_count.toBigInt(); i++) {
            const answerID = new AnswerID(examID, exam.questions[i].questionID, userID);
            const answer = this.answers.get(answerID).value;
            userAnswers.push(answer.answer);
            correctAnswers.push(exam.questions[i].correct_answer);
        }
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
    public checkUserScore(userID: Field, examID: Field): void {
        const [correctAnswers, userAnswers] = this.getUserAnswers(examID, userID);
        const score = this.calculateScore(correctAnswers, userAnswers);
        this.userScores.set(new UserExam(examID, userID, UInt64.from(1)), score);
        this.userExams.set(userID, new UserExam(examID, userID, UInt64.from(1)));
    }
}
