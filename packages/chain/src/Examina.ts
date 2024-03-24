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
    Provable,
    PublicKey,
    Struct,
    UInt64,
} from "o1js";

interface ExamConfig { }

export class Question extends Struct({
    questionID: UInt64,
    correct_answer: UInt64,
}) {
    constructor(questionID: UInt64, correct_answer: UInt64) {
        super({ questionID, correct_answer });
        this.questionID = questionID;
        this.correct_answer = correct_answer;
    }
}
export class Answer extends Struct({
    question: Question,
    answer: UInt64,
}) {
    constructor(question: Question, answer: UInt64) {
        super({ question, answer });
        this.question = question;
        this.answer = answer;
    }
}
export class Exam120 extends Struct({
    questions_count: UInt64,
    creator: PublicKey,
    questions: Provable.Array(Question, 120),
    start_time: Field,
    end_time: Field,
}) {
    constructor(
        questions_count: UInt64,
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
    examID: UInt64,
    questionID: UInt64,
    userID: UInt64
}) {
    constructor(examID: UInt64, questionID: UInt64, userID: UInt64) {
        super({ examID, questionID, userID });
        this.examID = examID;
        this.questionID = questionID;
        this.userID = userID;
    }
}
@runtimeModule()
export class Examina extends RuntimeModule<ExamConfig> {
    @state() public exams = StateMap.from<UInt64, Exam120>(UInt64, Exam120);
    @state() public answers = StateMap.from<AnswerID, Answer>(AnswerID, Answer);

    @runtimeMethod()
    public createExam(examID: UInt64, Exam: Exam120): void {
        this.exams.set(examID, Exam);
    }

    @runtimeMethod()
    public submitAnswer(answerID: AnswerID, answer: Answer): void {
        const start_time = this.exams.get(answerID.examID).value.start_time;
        const end_time = this.exams.get(answerID.examID).value.end_time;
        this.answers.set(answerID, answer);
    }
}
