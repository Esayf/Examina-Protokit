import express, { Express, Request, Response } from "express";
import { client } from "chain";
import { AnswerID, Exam120, Question, Questions, UserAnswer, UserExam } from "chain/dist/Examina";
import { CircuitString, Field, Poseidon, PrivateKey, UInt64 } from "o1js";
const server = express();
server.use(express.json());
const serverKey = PrivateKey.random();
const serverPubKey = serverKey.toPublicKey();
await client.start();

const mockQuestions = [
  {
    questionID: Field.from(1),
    questionHash: Field.from(1),
    correct_answer: Field.from(1),
  },
  {
    questionID: Field.from(2),
    questionHash: Field.from(2),
    correct_answer: Field.from(2),
  },
  {
    questionID: Field.from(3),
    questionHash: Field.from(3),
    correct_answer: Field.from(3),
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
    const exam = new Exam120(UInt64.from(3), serverPubKey, UInt64.from(1), mockQuestions);
    const tx = await client.transaction(serverPubKey, () => {
      examina.createExam(Field.from("1"), exam);
    });
    tx.transaction = tx.transaction?.sign(serverKey);
    await tx.send();
    console.log("Exam created");
    res.send("Exam created");
  } catch (error) {
    console.error(error);
    res.json("Error creating exam");
  }

});

server.post("/create/exam", async (req, res) => {
  try {
    const examina = client.runtime.resolve("Examina");
    const examID = Poseidon.hash([Field(Buffer.from(req.body.examID).toString("hex"))]);
    const questions = req.body.questions;
    const questionsAsStruct: Question[] = questions.map((q: any) => {
      console.log("Question: ", {
        questionID: Poseidon.hash([Field(Buffer.from(q.questionID).toString("hex"))]),
        questionHash: CircuitString.fromString(q.question).hash(),
        correct_answer: Field.from(q.correct_answer)
      });
      return {
        questionID: Poseidon.hash([Field(Buffer.from(q.questionID).toString("hex"))]),
        questionHash: CircuitString.fromString(q.question).hash(),
        correct_answer: Field.from(q.correct_answer)
      };
    })
    const exam = new Exam120(UInt64.from(questions.length), serverPubKey, UInt64.from(1), questionsAsStruct);
    const tx = await client.transaction(serverPubKey, () => {
      examina.createExam(examID, exam);
    });
    tx.transaction = tx.transaction?.sign(serverKey);
    await tx.send();
    console.log("Exam created");
    res.send("Exam created");
  } catch (error) {
    console.error(error);
    res.json("Error creating exam");
  }
});

server.post("/submit-user-answer", async (req, res) => {
  console.log("Submit user answer: ", req.body);
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.body.examID).toString("hex"))]);
  const questionID = Poseidon.hash([Field(Buffer.from(req.body.questionID).toString("hex"))]);
  const userID = Poseidon.hash([Field(Buffer.from(req.body.userID).toString("hex"))]);
  const answer = Field.from(req.body.userAnswer);
  try {
    const tx = await client.transaction(serverPubKey, () => {
      examina.submitUserAnswer(new AnswerID(examID, questionID, userID), new UserAnswer(questionID, answer));
    });
    tx.transaction = tx.transaction?.sign(serverKey);
    tx.send().then(() => {
      console.log("User answer submitted in protokit: ", answer?.toJSON());
      res.send("User answer submitted");
    }).catch((error) => {
      console.log("Error submitting user answer in protokit: ", error);
      res.status(500).send("Error submitting user answer");
    });
  } catch (error) {
    console.log("An error here from submit answer protokit:", error);
    res.status(500).send("Error submitting user answer");
  }

});

/* server.post("/publish-correct-answers", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.body.examID).toString("hex"))]);
  let questions: Questions;
  questions = {
    array: req.body.questions.map((q: any) => {
      return {
        questionID: Poseidon.hash([Field(Buffer.from(q.questionID).toString("hex"))]),
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
  const tx = await client.transaction(serverPubKey, () => {
    examina.publishExamCorrectAnswers(examID, questions);
  });
  tx.transaction = tx.transaction?.sign(serverKey);
  await tx.send();
  res.json("Correct answers published");
}); */

server.post("/check-score", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.body.examID).toString("hex"))]);
  const userID = Poseidon.hash([Field(Buffer.from(req.body.userID).toString("hex"))]);
  let questions: Questions;
  questions = {
    array: req.body.questions.map((q: any) => {
      return {
        questionID: Poseidon.hash([Field(Buffer.from(q.questionID).toString("hex"))]),
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
  const tx_1 = await client.transaction(serverPubKey, () => {
    examina.publishExamCorrectAnswers(examID, questions);
  });
  tx_1.transaction = tx_1.transaction?.sign(serverKey);
  await tx_1.send();
  console.log("Correct answers published");
  const tx = await client.transaction(serverPubKey, () => {
    examina.checkUserScore(userID, examID);
  });
  tx.transaction = tx.transaction?.sign(serverKey);
  await tx.send();
  const userScore = await client.query.runtime.Examina.userScores.get(new UserExam(examID, userID, UInt64.from(1)));
  console.log("User score calculated: ", userScore?.toJSON());
  res.send({ score: userScore?.toJSON() });
});

server.get("/score/:examID/:userID", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.params.examID).toString("hex"))]);
  const userID = Poseidon.hash([Field(Buffer.from(req.params.userID).toString("hex"))]);
  const score = await client.query.runtime.Examina.userScores.get(new UserExam(examID, userID, UInt64.from(1)));
  console.log("Score: ", score?.toJSON());
  res.send({ score: score?.toJSON() });
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

server.get("/answers/:examID/:questionID/:userID", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.params.examID).toString("hex"))]);
  const questionID = Poseidon.hash([Field(Buffer.from(req.params.questionID).toString("hex"))]);
  const userID = Poseidon.hash([Field(Buffer.from(req.params.userID).toString("hex"))]);
  const answer = await client.query.runtime.Examina.answers.get(new AnswerID(examID, questionID, userID));
  console.log("Answer: ", answer?.answer.toJSON());
  res.json("Answer: " + answer?.answer.toJSON());
});

server.listen(5005, () => {
  console.log("Server is running on http://localhost:5005");
});