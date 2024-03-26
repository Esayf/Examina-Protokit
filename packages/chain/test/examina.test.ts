import { TestingAppChain } from "@proto-kit/sdk";
import { Bool, CircuitString, Field, Poseidon, PrivateKey, PublicKey, UInt64 } from "o1js";
import { AnswerID, Exam120, Examina, Question, UserAnswer } from "../src/Examina";
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
    let mockQuestionID_2: Buffer;
    let mockQuestionID_3: Buffer;
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
        mockQuestionID_2 = Buffer.from("QD2");
        mockQuestionID_3 = Buffer.from("QD3");
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
        const mockUserID_Buffer = Buffer.from("USR91290211");
        const mockUserID_1 = Poseidon.hash([Field(mockUserID_Buffer.toString("hex"))]);
        const mockAnswer = new UserAnswer(mockQuestions[0], Field(1));
        const answerID: AnswerID = new AnswerID(mockExamID_1, Poseidon.hash([Field(mockQuestionID.toString("hex"))]), mockUserID_1);
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
});