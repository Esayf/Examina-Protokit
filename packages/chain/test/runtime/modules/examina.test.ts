import { TestingAppChain } from "@proto-kit/sdk";
import { CircuitString, Field, Poseidon, PrivateKey, PublicKey, UInt64 } from "o1js";
import { AnswerID, Exam120, Examina, Question, Questions, UserAnswer, UserExam } from "../../../src/runtime/modules/Examina";
import { log } from "@proto-kit/common";
log.setLevel("ERROR");

describe("Examina", () => {
    const appChain = TestingAppChain.fromRuntime({
        Examina
      });
  
      appChain.configurePartial({
        Runtime: {
          Balances: {
            totalSupply: UInt64.from(10000),
          },
          Examina: {
            incorrectToCorrectRatio: Field(0),
          },
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
    let questionID_4: Field
    let mockQuestionID_4: Buffer;
    let questionID_5: Field;
    let mockQuestionID_5: Buffer;
    let mockUserID_1: Field;
    let mockUserID_Buffer: Buffer;
    let alicePrivateKey: PrivateKey;
    let alice: PublicKey;
    let answerID: AnswerID;
    let answerID_2: AnswerID;
    let answerID_3: AnswerID;
    let userAnswer: UserAnswer | undefined;
    let userAnswer_2: UserAnswer | undefined;
    let userAnswer_3: UserAnswer | undefined;
    let userAnswer_4: UserAnswer | undefined;
    let userAnswer_5: UserAnswer | undefined;
    let mockQuestionID_6: Buffer;
    let questionID_6: Field;
    let mockQuestionID_7: Buffer;
    let questionID_7: Field;
    let mockQuestionID_8: Buffer;
    let questionID_8: Field;
    let mockQuestionID_9: Buffer;
    let questionID_9: Field;
    let mockQuestionID_10: Buffer;
    let questionID_10: Field;
    let mockUserID_2: Field;
    let mockUserID_2_Buffer: Buffer;
    let answerID_6: AnswerID;
    let answerID_7: AnswerID;
    let answerID_8: AnswerID;
    let answerID_9: AnswerID;
    let answerID_10: AnswerID;
    let userAnswer_6: UserAnswer | undefined;
    let userAnswer_7: UserAnswer | undefined;
    let userAnswer_8: UserAnswer | undefined;
    let userAnswer_9: UserAnswer | undefined;
    let userAnswer_10: UserAnswer | undefined;


    beforeAll(async () => {

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
        mockQuestionID_4 = Buffer.from("QD4");
        questionID_4 = Poseidon.hash([Field(mockQuestionID_4.toString("hex"))])
        mockQuestionID_5 = Buffer.from("QD5");
        questionID_5 = Poseidon.hash([Field(mockQuestionID_5.toString("hex"))])
        mockQuestionID_6 = Buffer.from("QD6");
        questionID_6 = Poseidon.hash([Field(mockQuestionID_6.toString("hex"))]);
        mockQuestionID_7 = Buffer.from("QD7");
        questionID_7 = Poseidon.hash([Field(mockQuestionID_7.toString("hex"))]);
        mockQuestionID_8 = Buffer.from("QD8");
        questionID_8 = Poseidon.hash([Field(mockQuestionID_8.toString("hex"))]);
        mockQuestionID_9 = Buffer.from("QD9");
        questionID_9 = Poseidon.hash([Field(mockQuestionID_9.toString("hex"))]);
        mockQuestionID_10 = Buffer.from("QD10");
        questionID_10 = Poseidon.hash([Field(mockQuestionID_10.toString("hex"))]);
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
            },
            {
                questionID: Poseidon.hash([Field(mockQuestionID_4.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 4 + 4?").hash(),
                correct_answer: Field(0),
            },
            {
                questionID: Poseidon.hash([Field(mockQuestionID_5.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 5 + 5?").hash(),
                correct_answer: Field(0),
            },
            {
                questionID: Poseidon.hash([Field(mockQuestionID_6.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 6 + 6?").hash(),
                correct_answer: Field(0),
            },
            {
                questionID: Poseidon.hash([Field(mockQuestionID_7.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 7 + 7?").hash(),
                correct_answer: Field(0),
            },
            {
                questionID: Poseidon.hash([Field(mockQuestionID_8.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 8 + 8?").hash(),
                correct_answer: Field(0),
            },
            {
                questionID: Poseidon.hash([Field(mockQuestionID_9.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 9 + 9?").hash(),
                correct_answer: Field(0),
            },
            {
                questionID: Poseidon.hash([Field(mockQuestionID_10.toString("hex"))]),
                questionHash: CircuitString.fromString("What is 10 + 10?").hash(),
                correct_answer: Field(0),
            }
        ]

        const zeroQuestion = {
            questionID: Field(0),
            questionHash: Field(0),
            correct_answer: Field(0),
        }
        for (let i = 0; i < 120 - 10; i++) {
            mockQuestions.push(zeroQuestion);
        }

        const mockExam: Exam120 = new Exam120(UInt64.from(10), alice, UInt64.from(1), mockQuestions);


        const tx1 = await appChain.transaction(alice, async () => {
            await examina.createExam(mockExamID_1, mockExam);
        });

        await tx1.sign();
        await tx1.send();

        const block = await appChain.produceBlock();

        const exam = await appChain.query.runtime.Examina.exams.get(mockExamID_1);

        expect(block?.transactions[0].status.toBoolean()).toBe(true);
        expect(exam != undefined).toBe(true);
        expect(exam?.questions_count.toString()).toBe("10");
        expect(exam?.isActive.toString()).toBe("1");
        console.log("------------------------END OF CREATE EXAM TEST ----------------------")
    }, 150_000);
    it("should submit answer", async () => {
        const exam_again = await appChain.query.runtime.Examina.exams.get(mockExamID_1);
        expect(exam_again?.isActive.toString()).toBe("1");
        mockUserID_Buffer = Buffer.from("USR9129s211");
        mockUserID_1 = Poseidon.hash([Field(mockUserID_Buffer.toString("hex"))]);
        const mockAnswer = new UserAnswer(questionID, Field(2));
        answerID = new AnswerID(mockExamID_1, questionID, mockUserID_1);
        const tx2 = await appChain.transaction(alice, async () => {
            await examina.submitUserAnswer(answerID, mockAnswer);
        });
        await tx2.sign();
        await tx2.send();
        const block2 = await appChain.produceBlock();
        userAnswer = await appChain.query.runtime.Examina.answers.get(answerID);
        console.log("Block2: ", block2);
        expect(block2?.transactions[0].status.toBoolean()).toBe(true);
        expect(userAnswer != undefined).toBe(true);
    }, 150_000);
    it("should submit answers as one transaction submitUserAnswers", async () => {
        const mockAnswer = new UserAnswer(questionID, Field(2));
        const mockAnswer_2 = new UserAnswer(questionID_2, Field(3));
        const mockAnswer_3 = new UserAnswer(questionID_3, Field(1));
        const mockAnswer_4 = new UserAnswer(questionID_4, Field(2));
        const mockAnswer_5 = new UserAnswer(questionID_5, Field(4));
        const mockAnswer_6 = new UserAnswer(questionID_6, Field(2));
        const mockAnswer_7 = new UserAnswer(questionID_7, Field(2));
        const mockAnswer_8 = new UserAnswer(questionID_8, Field(2));
        const mockAnswer_9 = new UserAnswer(questionID_9, Field(2));
        const mockAnswer_10 = new UserAnswer(questionID_10, Field(1));
        const answers = [
            {
                answerID: new AnswerID(mockExamID_1, questionID, mockUserID_1),
                answer: mockAnswer
            },
            {
                answerID: new AnswerID(mockExamID_1, questionID_2, mockUserID_1),
                answer: mockAnswer_2
            },
            {
                answerID: new AnswerID(mockExamID_1, questionID_3, mockUserID_1),
                answer: mockAnswer_3
            },
            {
                answerID: new AnswerID(mockExamID_1, questionID_4, mockUserID_1),
                answer: mockAnswer_4
            },
            {
                answerID: new AnswerID(mockExamID_1, questionID_5, mockUserID_1),
                answer: mockAnswer_5
            },
            {
                answerID: new AnswerID(mockExamID_1, questionID_6, mockUserID_1),
                answer: mockAnswer_6
            },
            {
                answerID: new AnswerID(mockExamID_1, questionID_7, mockUserID_1),
                answer: mockAnswer_7
            },
            {
                answerID: new AnswerID(mockExamID_1, questionID_8, mockUserID_1),
                answer: mockAnswer_8
            },
            {
                answerID: new AnswerID(mockExamID_1, questionID_9, mockUserID_1),
                answer: mockAnswer_9
            },
            {
                answerID: new AnswerID(mockExamID_1, questionID_10, mockUserID_1),
                answer: mockAnswer_10
            }
        ]
        for(let i = 0; i < 120 - 10; i++) {
            answers.push({
                answerID: new AnswerID(mockExamID_1, Field(0), mockUserID_1),
                answer: new UserAnswer(Field(0), Field(0))
            })
        }
        const answersInput = { answers: answers };
        const tx3 = await appChain.transaction(alice, async () => {
            await examina.submitUserAnswers(answersInput);
        });
        await tx3.sign();
        await tx3.send();
        const block3 = await appChain.produceBlock();
        console.log("Block3: ", block3);
        const userAnswer_2 = await appChain.query.runtime.Examina.answers.get(new AnswerID(mockExamID_1, questionID_2, mockUserID_1));
        const userAnswer_3 = await appChain.query.runtime.Examina.answers.get(new AnswerID(mockExamID_1, questionID_3, mockUserID_1));
        const userAnswer_4 = await appChain.query.runtime.Examina.answers.get(new AnswerID(mockExamID_1, questionID_4, mockUserID_1));
        const userAnswer_5 = await appChain.query.runtime.Examina.answers.get(new AnswerID(mockExamID_1, questionID_5, mockUserID_1));
        const userAnswer_6 = await appChain.query.runtime.Examina.answers.get(new AnswerID(mockExamID_1, questionID_6, mockUserID_1));
        const userAnswer_7 = await appChain.query.runtime.Examina.answers.get(new AnswerID(mockExamID_1, questionID_7, mockUserID_1));
        const userAnswer_8 = await appChain.query.runtime.Examina.answers.get(new AnswerID(mockExamID_1, questionID_8, mockUserID_1));
        const userAnswer_9 = await appChain.query.runtime.Examina.answers.get(new AnswerID(mockExamID_1, questionID_9, mockUserID_1));
        const userAnswer_10 = await appChain.query.runtime.Examina.answers.get(new AnswerID(mockExamID_1, questionID_10, mockUserID_1));
        expect(block3?.transactions[0].status.toBoolean()).toBe(true);
        expect(userAnswer_2 != undefined).toBe(true);
        expect(userAnswer_3 != undefined).toBe(true);
        expect(userAnswer_4 != undefined).toBe(true);
        expect(userAnswer_5 != undefined).toBe(true);
        expect(userAnswer_6 != undefined).toBe(true);
        expect(userAnswer_7 != undefined).toBe(true);
        expect(userAnswer_8 != undefined).toBe(true);
        expect(userAnswer_9 != undefined).toBe(true);
        expect(userAnswer_10 != undefined).toBe(true);
        expect(userAnswer_2?.answer.toString()).toBe("3");
        expect(userAnswer_3?.answer.toString()).toBe("1");
        expect(userAnswer_4?.answer.toString()).toBe("2");
        expect(userAnswer_5?.answer.toString()).toBe("4");
        expect(userAnswer_6?.answer.toString()).toBe("2");
        expect(userAnswer_7?.answer.toString()).toBe("2");
        expect(userAnswer_8?.answer.toString()).toBe("2");
        expect(userAnswer_9?.answer.toString()).toBe("2");
        expect(userAnswer_10?.answer.toString()).toBe("1");

    }, 150_000);
    it("should get user answers", async () => {
        const mockAnswer_2 = new UserAnswer(questionID_2, Field(3));
        const mockAnswer_3 = new UserAnswer(questionID_3, Field(1));
        const mockAnswer_4 = new UserAnswer(questionID_4, Field(2));
        const mockAnswer_5 = new UserAnswer(questionID_5, Field(4));
        const mockAnswer_6 = new UserAnswer(questionID_6, Field(2));
        const mockAnswer_7 = new UserAnswer(questionID_7, Field(2));
        const mockAnswer_8 = new UserAnswer(questionID_8, Field(2));
        const mockAnswer_9 = new UserAnswer(questionID_9, Field(2));
        const mockAnswer_10 = new UserAnswer(questionID_10, Field(1));

        answerID_2 = new AnswerID(mockExamID_1, questionID_2, mockUserID_1);
        const tx2 = await appChain.transaction(alice, async () => {
            await examina.submitUserAnswer(answerID_2, mockAnswer_2);
        });
        await tx2.sign();
        await tx2.send();
        const block2 = await appChain.produceBlock();
        userAnswer = await appChain.query.runtime.Examina.answers.get(answerID);
        expect(block2?.transactions[0].status.toBoolean()).toBe(true);
        expect(userAnswer != undefined).toBe(true);
        const answerID_3: AnswerID = new AnswerID(mockExamID_1, questionID_3, mockUserID_1);
        const tx3 = await appChain.transaction(alice, async () => {
            await examina.submitUserAnswer(answerID_3, mockAnswer_3);
        });
        await tx3.sign();
        await tx3.send();
        const block3 = await appChain.produceBlock();

        const answerID_4: AnswerID = new AnswerID(mockExamID_1, questionID_4, mockUserID_1);
        const tx4 = await appChain.transaction(alice, async () => {
            await examina.submitUserAnswer(answerID_4, mockAnswer_4);
        });
        await tx4.sign();
        await tx4.send();
        const block4 = await appChain.produceBlock();
        const answerID_5: AnswerID = new AnswerID(mockExamID_1, questionID_5, mockUserID_1);
        const tx5 = await appChain.transaction(alice, async () => {
            await examina.submitUserAnswer(answerID_5, mockAnswer_5);
        });
        await tx5.sign();
        await tx5.send();
        const block5 = await appChain.produceBlock();

        const answerID_6: AnswerID = new AnswerID(mockExamID_1, questionID_6, mockUserID_1);
        const tx6 = await appChain.transaction(alice, async () => {
            await examina.submitUserAnswer(answerID_6, mockAnswer_6);
        });
        await tx6.sign();
        await tx6.send();
        const block6 = await appChain.produceBlock();
        const answerID_7: AnswerID = new AnswerID(mockExamID_1, questionID_7, mockUserID_1);
        const tx7 = await appChain.transaction(alice, async () => {
            await examina.submitUserAnswer(answerID_7, mockAnswer_7);
        });
        await tx7.sign();
        await tx7.send();
        const block7 = await appChain.produceBlock();

        const answerID_8: AnswerID = new AnswerID(mockExamID_1, questionID_8, mockUserID_1);
        const tx8 = await appChain.transaction(alice, async () => {
            await examina.submitUserAnswer(answerID_8, mockAnswer_8);
        });
        await tx8.sign();
        await tx8.send();
        const block8 = await appChain.produceBlock();

        const answerID_9: AnswerID = new AnswerID(mockExamID_1, questionID_9, mockUserID_1);
        const tx9 = await appChain.transaction(alice, async () => {
            await examina.submitUserAnswer(answerID_9, mockAnswer_9);
        });
        await tx9.sign();
        await tx9.send();
        const block9 = await appChain.produceBlock();

        const answerID_10: AnswerID = new AnswerID(mockExamID_1, questionID_10, mockUserID_1);
        const tx10 = await appChain.transaction(alice, async () => {
            await examina.submitUserAnswer(answerID_10, mockAnswer_10);
        });
        await tx10.sign();
        await tx10.send();
        const block10 = await appChain.produceBlock();

        userAnswer_6 = await appChain.query.runtime.Examina.answers.get(answerID_6);
        userAnswer_7 = await appChain.query.runtime.Examina.answers.get(answerID_7);
        userAnswer_8 = await appChain.query.runtime.Examina.answers.get(answerID_8);
        userAnswer_9 = await appChain.query.runtime.Examina.answers.get(answerID_9);
        userAnswer_10 = await appChain.query.runtime.Examina.answers.get(answerID_10);

        expect(block6?.transactions[0].status.toBoolean()).toBe(true);
        expect(block7?.transactions[0].status.toBoolean()).toBe(true);
        expect(block8?.transactions[0].status.toBoolean()).toBe(true);
        expect(block9?.transactions[0].status.toBoolean()).toBe(true);
        expect(block10?.transactions[0].status.toBoolean()).toBe(true);
        expect(userAnswer_6 != undefined).toBe(true);
        expect(userAnswer_7 != undefined).toBe(true);
        expect(userAnswer_8 != undefined).toBe(true);
        expect(userAnswer_9 != undefined).toBe(true);
        expect(userAnswer_10 != undefined).toBe(true);
        userAnswer_2 = await appChain.query.runtime.Examina.answers.get(answerID_2);
        expect(block3?.transactions[0].status.toBoolean()).toBe(true);
        expect(block4?.transactions[0].status.toBoolean()).toBe(true);
        expect(block5?.transactions[0].status.toBoolean()).toBe(true);
        expect(userAnswer_2 != undefined).toBe(true);
        userAnswer_3 = await appChain.query.runtime.Examina.answers.get(answerID_3);
        userAnswer_4 = await appChain.query.runtime.Examina.answers.get(answerID_4);
        userAnswer_5 = await appChain.query.runtime.Examina.answers.get(answerID_5);
        expect(userAnswer_3 != undefined).toBe(true);
        expect(userAnswer_2?.answer.toString()).toBe("3");
        expect(userAnswer_3?.answer.toString()).toBe("1");
        expect(userAnswer_4?.answer.toString()).toBe("2");
        expect(userAnswer_5?.answer.toString()).toBe("4");
    }, 150_000);
    it("should publishExamCorrectAnswers", async () => {

        const mockCorrectAnswers: Questions = {
            array: [
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
                },
                {
                    questionID: Poseidon.hash([Field(mockQuestionID_4.toString("hex"))]),
                    questionHash: CircuitString.fromString("What is 4 + 4?").hash(),
                    correct_answer: Field(2),
                },
                {
                    questionID: Poseidon.hash([Field(mockQuestionID_5.toString("hex"))]),
                    questionHash: CircuitString.fromString("What is 5 + 5?").hash(),
                    correct_answer: Field(4),
                },
                {
                    questionID: Poseidon.hash([Field(mockQuestionID_6.toString("hex"))]),
                    questionHash: CircuitString.fromString("What is 6 + 6?").hash(),
                    correct_answer: Field(2),
                },
                {
                    questionID: Poseidon.hash([Field(mockQuestionID_7.toString("hex"))]),
                    questionHash: CircuitString.fromString("What is 7 + 7?").hash(),
                    correct_answer: Field(2),
                },
                {
                    questionID: Poseidon.hash([Field(mockQuestionID_8.toString("hex"))]),
                    questionHash: CircuitString.fromString("What is 8 + 8?").hash(),
                    correct_answer: Field(2),
                },
                {
                    questionID: Poseidon.hash([Field(mockQuestionID_9.toString("hex"))]),
                    questionHash: CircuitString.fromString("What is 9 + 9?").hash(),
                    correct_answer: Field(2),
                },
                {
                    questionID: Poseidon.hash([Field(mockQuestionID_10.toString("hex"))]),
                    questionHash: CircuitString.fromString("What is 10 + 10?").hash(),
                    correct_answer: Field(2),
                }
            ]
        };
        const zeroQuestion = {
            questionID: Field(0),
            questionHash: Field(0),
            correct_answer: Field(0),
        }
        for (let i = 0; i < 120 - 10; i++) {
            mockCorrectAnswers.array.push(zeroQuestion);
        }
        const tx3 = await appChain.transaction(alice, async () => {
            await examina.publishExamCorrectAnswers(mockExamID_1, mockCorrectAnswers);
        });
        await tx3.sign();
        await tx3.send();
        const block3 = await appChain.produceBlock();
        const exam = await appChain.query.runtime.Examina.exams.get(mockExamID_1);
        expect(block3?.transactions[0].status.toBoolean()).toBe(true);
        expect(exam?.isActive.toString()).toBe("2");
    }, 150_000);
    it("should calculate score", async () => {
        const tx4 = await appChain.transaction(alice, async () => {
            await examina.checkUserScore(mockUserID_1, mockExamID_1);
        });
        await tx4.sign();
        await tx4.send();
        const block4 = await appChain.produceBlock();
        console.log("Block4: ", block4);
        const userScore = await appChain.query.runtime.Examina.userScores.get(new UserExam(mockExamID_1, mockUserID_1, UInt64.from(1)));
        expect(block4?.transactions[0].status.toBoolean()).toBe(true);
        expect(userScore != undefined).toBe(true);
        expect(userScore?.toString()).toBe("9");
    }, 150_000);
});