import { TestingAppChain } from "@proto-kit/sdk";
import { Bool, CircuitString, Field, Poseidon, PrivateKey, PublicKey, UInt64 } from "o1js";
import { AnswerID, Exam120, Examina, Question, Questions, UserAnswer } from "../src/Examina";
import { log } from "@proto-kit/common";
import { InMemoryDatabase, LocalTaskWorkerModule, PrivateMempool, SettlementModule } from "@proto-kit/sequencer";
log.setLevel("DEBUG");

describe("Examina", () => {

    let appChain = TestingAppChain.fromRuntime({
        modules: {
            Examina,
        },
    });
    let examina: Examina;
    let mockExamID_Buffer: Buffer;
    let mockExamID_1: Field;
    let mockQuestions: Question[];
    let mockQuestionID: Buffer;
    let questionID: Field;
    let mockQuestionID_2: Buffer;
    let questionID_2: Field;
    let mockQuestionID_3: Buffer;
    let questionID_3: Field;
    let mockUserID_1: Field;
    let mockUserID_Buffer: Buffer;
    let alicePrivateKey: PrivateKey;
    let alice: PublicKey;


    beforeAll(async () => {
        appChain.configurePartial({
            Runtime: {
                Examina: {
                    incorrectToCorrectRatio: UInt64.from(0),
                },
            },
        });
        alicePrivateKey = PrivateKey.random();
        alice = alicePrivateKey.toPublicKey();
        await appChain.start();
        examina = appChain.runtime.resolve("Examina");
        appChain.setSigner(alicePrivateKey);
    });

    it("should create an exam", async () => {
        mockExamID_Buffer = Buffer.from("BDD91290211");
        mockExamID_1 = Poseidon.hash([Field(mockExamID_Buffer.toString("hex"))])
        mockQuestionID = Buffer.from("QD1");
        questionID = Poseidon.hash([Field(mockQuestionID.toString("hex"))])
        mockQuestionID_2 = Buffer.from("QD2");
        questionID_2 = Poseidon.hash([Field(mockQuestionID_2.toString("hex"))])
        mockQuestionID_3 = Buffer.from("QD3");
        questionID_3 = Poseidon.hash([Field(mockQuestionID_3.toString("hex"))])
        mockQuestions = [
            {
                questionID: Poseidon.hash([Field(mockQuestionID.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 1 + 1?").hash(),
                correct_answer: Field(0),
            },
            {
                questionID: Poseidon.hash([Field(mockQuestionID_2.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 2 + 2?").hash(),
                correct_answer: Field(0),
            },
            {
                questionID: Poseidon.hash([Field(mockQuestionID_3.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 3 + 3?").hash(),
                correct_answer: Field(0),
            }
        ]

        const mockExam: Exam120 = new Exam120(UInt64.from(3), alice, UInt64.from(1), mockQuestions);


        const tx1 = await appChain.transaction(alice, () => {
            examina.createExam(mockExamID_1, mockExam);
        });

        await tx1.sign();
        await tx1.send();

        const block = await appChain.produceBlock();

        const exam = await appChain.query.runtime.Examina.exams.get(mockExamID_1);

        expect(block?.transactions[0].status.toBoolean()).toBe(true);
        expect(exam != undefined).toBe(true);
        expect(exam?.questions_count.toString()).toBe("3");
        expect(exam?.isActive.toString()).toBe("1");
        console.log("------------------------END OF CREATE EXAM TEST ----------------------")
    }, 150_000);
    it("should submit an answer", async () => {
        const exam_again = await appChain.query.runtime.Examina.exams.get(mockExamID_1);
        expect(exam_again?.isActive.toString()).toBe("1");
        mockUserID_Buffer = Buffer.from("USR91290211");
        mockUserID_1 = Poseidon.hash([Field(mockUserID_Buffer.toString("hex"))]);
        const mockAnswer = new UserAnswer(questionID, Field(1));
        const answerID: AnswerID = new AnswerID(mockExamID_1, questionID, mockUserID_1);
        const tx2 = await appChain.transaction(alice, () => {
            examina.submitUserAnswer(answerID, mockAnswer);
        });
        await tx2.sign();
        await tx2.send();
        const block2 = await appChain.produceBlock();
        const userAnswer = await appChain.query.runtime.Examina.answers.get(answerID);
        expect(block2?.transactions[0].status.toBoolean()).toBe(true);
        expect(userAnswer != undefined).toBe(true);
    }, 150_000);
    it("should get user answers", async () => {
        const mockAnswer = new UserAnswer(questionID_2, Field(1));
        const mockAnswer_2 = new UserAnswer(questionID_3, Field(2));
        const answerID: AnswerID = new AnswerID(mockExamID_1, questionID_2, mockUserID_1);
        const tx2 = await appChain.transaction(alice, () => {
            examina.submitUserAnswer(answerID, mockAnswer);
        });
        await tx2.sign();
        await tx2.send();
        const block2 = await appChain.produceBlock();
        const userAnswer = await appChain.query.runtime.Examina.answers.get(answerID);
        expect(block2?.transactions[0].status.toBoolean()).toBe(true);
        expect(userAnswer != undefined).toBe(true);
        const answerID_2: AnswerID = new AnswerID(mockExamID_1, questionID_3, mockUserID_1);
        const tx3 = await appChain.transaction(alice, () => {
            examina.submitUserAnswer(answerID_2, mockAnswer_2);
        });
        await tx3.sign();
        await tx3.send();
        const block3 = await appChain.produceBlock();
        const userAnswer_2 = await appChain.query.runtime.Examina.answers.get(answerID);
        expect(block3?.transactions[0].status.toBoolean()).toBe(true);
        expect(userAnswer_2 != undefined).toBe(true);
        const userAnswer_3 = await appChain.query.runtime.Examina.answers.get(answerID_2);
        expect(userAnswer_3 != undefined).toBe(true);
        expect(userAnswer_2?.answer.toString()).toBe("1");
        expect(userAnswer_3?.answer.toString()).toBe("2");
    }, 150_000);
    it("should publishExamCorrectAnswers", async () => {
        
        const mockCorrectAnswers: Questions = { array: [
            {
                questionID: Poseidon.hash([Field(mockQuestionID.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 1 + 1?").hash(),
                correct_answer: Field(2),
            },
            {
                questionID: Poseidon.hash([Field(mockQuestionID_2.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 2 + 2?").hash(),
                correct_answer: Field(3),
            },
            {
                questionID: Poseidon.hash([Field(mockQuestionID_3.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 3 + 3?").hash(),
                correct_answer: Field(1),
            }
        ]};
        const tx3 = await appChain.transaction(alice, () => {
            examina.publishExamCorrectAnswers(mockExamID_1, mockCorrectAnswers);
        });
        await tx3.sign();
        await tx3.send();
        const block3 = await appChain.produceBlock();
        const exam = await appChain.query.runtime.Examina.exams.get(mockExamID_1);
        expect(block3?.transactions[0].status.toBoolean()).toBe(true);
        expect(exam?.isActive.toString()).toBe("2");
    }, 150_000);
    it("should calculate score", async () => {
        const tx4 = await appChain.transaction(alice, () => {
            examina.checkUserScore(calculateProof, controller);
        });
        await tx4.sign();
        await tx4.send();
        const block4 = await appChain.produceBlock();
        expect(block4?.transactions[0].status.toBoolean()).toBe(true);
    }, 150_000);
});