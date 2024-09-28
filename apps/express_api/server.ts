import express, { Express, Request, Response } from "express";
import { client } from "chain";
import { AnswerID, Exam120, Question, Questions, UserAnswer, UserAnswerInput, UserAnswersInput, UserExam } from "chain/dist/runtime/modules/Examina";
//import { CalculateScore } from "chain/dist/score-calculator/ScoreZkProgram";
import { CircuitString, Field, Poseidon, PrivateKey, UInt64, ZkProgram } from "o1js";

const server = express();
server.use(express.json());
//const verificationKey = await CalculateScore.compile();
//let MyProof = ZkProgram.Proof(CalculateScore);

const serverKey = PrivateKey.random();
const serverPubKey = serverKey.toPublicKey();
await client.start();
const mockQuestions: Question[] = [
  {
    questionID:  Poseidon.hash([Field(Buffer.from("1").toString("hex"))]),
    questionHash: Poseidon.hash([Field(Buffer.from("1").toString("hex"))]),
    correct_answer: Poseidon.hash([Field(Buffer.from("1").toString("hex"))]),
  },
  {
    questionID: Poseidon.hash([Field(Buffer.from("2").toString("hex"))]),
    questionHash: Poseidon.hash([Field(Buffer.from("2").toString("hex"))]),
    correct_answer: Poseidon.hash([Field(Buffer.from("2").toString("hex"))]),
  },
  {
    questionID: Poseidon.hash([Field(Buffer.from("3").toString("hex"))]),
    questionHash: Poseidon.hash([Field(Buffer.from("3").toString("hex"))]),
    correct_answer: Poseidon.hash([Field(Buffer.from("3").toString("hex"))]),
  },
];

server.get("/", async (req, res) => {
  res.json("Hello World!");
});

server.get("/create/mock_exam", async (req, res) => {
  try {
    const examina = client.runtime.resolve("Examina");
    //const examID = Field.from(req.body.examID);
    //const questions = req.body.questions;
    const questionsLength = mockQuestions.length
    for(let i = 0; i < 120 - questionsLength; i++) {
      mockQuestions.push({
        questionID: Field.from(i + questionsLength + 1),
        questionHash: Field.from(i + questionsLength + 1),
        correct_answer: Field.from(i + questionsLength + 1),
      });
    }
    const exam = new Exam120(serverPubKey, UInt64.from(1), mockQuestions);
    const tx = await client.transaction(serverPubKey, async () => {
      await examina.createExam(Field(Buffer.from("1").toString("hex")), exam);
    });
    tx.transaction = tx.transaction?.sign(serverKey);
    await tx.send();
    console.log("Exam created");
    res.send("Exam created");
  } catch (error) {
    console.error(error);
    res.status(500).json("Error creating exam");
  }

});

server.post("/create/exam", async (req, res) => {
  try {
    const examina = client.runtime.resolve("Examina");
    console.log("Create exam body: ", req.body);
    const examID = Poseidon.hash([Field(Buffer.from(req.body.examID).toString("hex"))]);
    const questions = req.body.questions;
    const questionsAsStruct: Question[] = questions.map((q: any) => {
      console.log("Question: ", {
        questionID: Poseidon.hash([Field(Buffer.from(q.questionID).toString("hex"))]),
        questionHash: CircuitString.fromString(q.question).hash(),
        correct_answer: Field(Number(q.correct_answer))
      });
      return {
        questionID: Poseidon.hash([Field(Buffer.from(q.questionID).toString("hex"))]),
        questionHash: CircuitString.fromString(q.question).hash(),
        correct_answer: Field(Number(q.correct_answer))
      };
    })
    console.log("Questions as struct: ", questionsAsStruct);
    console.log("Questions length: ", questions.length);
    for (let i = 0; i < 120 - questions.length; i++) {
      questionsAsStruct.push({
        questionID: Field(Number(0)),
        questionHash: Field(Number(0)),
        correct_answer: Field(Number(0)),
      });
    }
    const exam = new Exam120(serverPubKey, UInt64.from(Number(1)), questionsAsStruct);
    const tx = await client.transaction(serverPubKey, async () => {
      await examina.createExam(examID, exam);
    });
    tx.transaction = tx.transaction?.sign(serverKey);
    await tx.send();
    console.log("Exam created");
    res.status(200).send("Exam created");
  } catch (error) {
    console.error(error);
    res.status(500).json("Error creating exam");
  }
});

server.post("/submit-user-answers", async (req, res) => {
  console.log("Submit user answers: ", req.body);
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.body.examID).toString("hex"))]);
  console.log("Exam id buffer", Buffer.from(req.body.examID).toString("hex"))
  console.log("ExamID: ", examID);
  const userID = Poseidon.hash([Field(Buffer.from(req.body.userID).toString("hex"))]);
  console.log("User id buffer", Buffer.from(req.body.userID).toString("hex"))
  let answers: UserAnswersInput = {
    answers: req.body.answers.map((a: any) => {
      return {
        answerID: new AnswerID(examID, Poseidon.hash([Field(Buffer.from(a.questionID).toString("hex"))]), userID),
        answer: new UserAnswer(Poseidon.hash([Field(Buffer.from(a.questionID).toString("hex"))]), Field.from(a.answer))
      };
    })
  };
  const zeroAnswer: UserAnswerInput = { answerID: new AnswerID(examID, Field(0), userID), answer: new UserAnswer(Field(0), Field(0) )};
  for (let i = 0; i < 120 - req.body.answers.length; i++) {
    answers.answers.push(zeroAnswer);
  }
  const tx = await client.transaction(serverPubKey, async () => {
    await examina.submitUserAnswers(answers);
  });
  tx.transaction = tx.transaction?.sign(serverKey);
  tx.send().then(() => {
    console.log("User answers submitted");
    res.status(200).json("User answers submitted");
  }).catch((error) => {
    console.log("Error submitting user answers: ", error);
    res.status(500).send("Error submitting user answers");
  });
});


server.post("/publish-correct-answers", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.body.examID).toString("hex"))]);
  const exam = await client.query.runtime.Examina.exams.get(examID);
  if(!exam) {
    res.status(200).send("Exam not found so skip this step");
  }
  let questions: Questions;
  questions = {
    array: req.body.questions.map((q: any) => {
      return {
        questionID: Poseidon.hash([Field(Buffer.from(q.questionID.toString()).toString("hex"))]),
        questionHash: CircuitString.fromString(q.question).hash(),
        correct_answer: Field.from(q.correct_answer)
      };
    })
  };
  const zeroQuestion = {
    questionID: Field(0),
    questionHash: Field(0),
    correct_answer: Field(0),
  }
  for (let i = 0; i < 120 - req.body.questions.length; i++) {
    questions.array.push(zeroQuestion);
  }
  const tx_1 = await client.transaction(serverPubKey, async () => {
    await examina.publishExamCorrectAnswers(examID, questions);
  });
  tx_1.transaction = tx_1.transaction?.sign(serverKey);
  await tx_1.send();
  console.log("Correct answers published");
  res.status(200).json("Correct answers published");
});

server.post("/check-score", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.body.examID).toString("hex"))]);
  const userID = Poseidon.hash([Field(Buffer.from(req.body.userID).toString("hex"))]);
  const tx = await client.transaction(serverPubKey, async () => {
    await examina.checkUserScore(userID, examID);
  });
  tx.transaction = tx.transaction?.sign(serverKey);
  await tx.send();
  await new Promise((resolve) => setTimeout(resolve, 5000));
    const userScore = await client.query.runtime.Examina.userScores.get(new UserExam(examID, userID, UInt64.from(1)));
    const userScore0 = await client.query.runtime.Examina.userScores.get(new UserExam(examID, userID, UInt64.from(0)));
    const userScore2 = await client.query.runtime.Examina.userScores.get(new UserExam(examID, userID, UInt64.from(2)));

    console.log("User score calculated: ", userScore?.toJSON());
    console.log("User score calculated is active 0: ", userScore0?.toJSON());
    console.log("User score calculated is active 2: ", userScore2?.toJSON());
    return res.json({ score: userScore ? userScore.toJSON() : userScore0 ? userScore0.toJSON() : userScore2 ? userScore2.toJSON() : "User score not found"});
});

server.get("/score/:examID/:userID", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.params.examID).toString("hex"))]);
  const userID = Poseidon.hash([Field(Buffer.from(req.params.userID).toString("hex"))]);
  const score_1 = await client.query.runtime.Examina.userScores.get(new UserExam(examID, userID, UInt64.from(1)));
  const score_0 = await client.query.runtime.Examina.userScores.get(new UserExam(examID, userID, UInt64.from(0)));
  const score_2 = await client.query.runtime.Examina.userScores.get(new UserExam(examID, userID, UInt64.from(2)));


  console.log("Score_1: ", score_1?.toJSON());
  console.log("Score_2: ", score_2?.toJSON());
  
  res.status(200).send({ score: score_1 ? score_1.toJSON() : score_0 ? score_0.toJSON() : score_2 ? score_2.toJSON() : "User score not found"});
});

server.get("/exams/:examID", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const key = Poseidon.hash([Field(Buffer.from(req.params.examID).toString("hex"))]);
  const exam: Exam120 | undefined = await client.query.runtime.Examina.exams.get(key);
  res.json("Exam: " + 
  exam?.questions.map((q) => 
    q.correct_answer.toJSON() != "0" && q.correct_answer.greaterThan(Field(0)) ?
    (q.correct_answer.toJSON()) : ""));
});

server.get("/get_all_answers/:examID/:userID", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.params.examID).toString("hex"))]);
  const userID = Poseidon.hash([Field(Buffer.from(req.params.userID).toString("hex"))]);
  const exam = await client.query.runtime.Examina.exams.get(examID);
  let answers: string[] | undefined = [];
  exam?.questions.map(async (q) => {
    const answerID = new AnswerID(examID, q.questionID, userID);
    const answer = await client.query.runtime.Examina.answers.get(answerID);
    console.log("Answer: ", answer?.answer.toJSON());
    answers.push(answer?.answer.toString() ? answer?.answer.toString() : "0");
  });
  console.log("Answers: ", answers);
  res.json("Answers: " + answers);
});


server.get("/answers/:examID/:questionID/:userID", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.params.examID).toString("hex"))]);
  const questionID = Poseidon.hash([Field(Buffer.from(req.params.questionID).toString("hex"))]);
  const userID = Poseidon.hash([Field(Buffer.from(req.params.userID).toString("hex"))]);
  const answerID = new AnswerID(examID, questionID, userID);
  const answer = await client.query.runtime.Examina.answers.get(answerID);
  res.json("Answer: " + answer?.answer.toJSON());
});

server.listen(5005, () => {
  console.log("Server is running on http://localhost:5005");
});