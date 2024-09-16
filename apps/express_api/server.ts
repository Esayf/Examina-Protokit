import express, { Express, Request, Response } from "express";
import { client } from "chain";
import { AnswerID, Exam120, Question, Questions, UserAnswer, UserAnswerInput, UserAnswersInput, UserExam } from "chain/dist/runtime/modules/Examina";
import { CircuitString, Field, Poseidon, PrivateKey, UInt64 } from "o1js";
const server = express();
server.use(express.json());
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
    const exam = new Exam120(UInt64.from(3), serverPubKey, UInt64.from(1), mockQuestions);
    const tx = await client.transaction(serverPubKey, async () => {
      await examina.createExam(Field(Buffer.from("1").toString("hex")), exam);
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
    for (let i = 0; i < 120 - questions.length; i++) {
      questionsAsStruct.push({
        questionID: Field.from(i + questions.length + 1),
        questionHash: Field.from(i + questions.length + 1),
        correct_answer: Field.from(i + questions.length + 1),
      });
    }
    const exam = new Exam120(UInt64.from(questions.length), serverPubKey, UInt64.from(1), questionsAsStruct);
    const tx = await client.transaction(serverPubKey, async () => {
      await examina.createExam(examID, exam);
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
    const tx = await client.transaction(serverPubKey, async () => {
      await examina.submitUserAnswer(new AnswerID(examID, questionID, userID), new UserAnswer(questionID, answer));
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

server.post("/submit-user-answers", async (req, res) => {
  console.log("Submit user answers: ", req.body);
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.body.examID).toString("hex"))]);
  const userID = Poseidon.hash([Field(Buffer.from(req.body.userID).toString("hex"))]);
  let answers: UserAnswersInput = {
    answers: req.body.answers.map((a: any) => {
      return {
        answerID: new AnswerID(examID, Poseidon.hash([Field(Buffer.from(a.questionID).toString("hex"))]), userID),
        answer: new UserAnswer(Poseidon.hash([Field(Buffer.from(a.questionID).toString("hex"))]), Field.from(a.answer))
      };
    })
  };
  const zeroAnswer: UserAnswerInput = { answerID: new AnswerID(Field(0), Field(0), Field(0)), answer: new UserAnswer(Field(0), Field(0) )};
  for (let i = 0; i < 120 - req.body.answers.length; i++) {
    answers.answers.push(zeroAnswer);
  }
  const tx = await client.transaction(serverPubKey, async () => {
    await examina.submitUserAnswers(answers);
  });
  tx.transaction = tx.transaction?.sign(serverKey);
  tx.send().then(() => {
    console.log("User answers submitted");
    res.send("User answers submitted");
  }).catch((error) => {
    console.log("Error submitting user answers: ", error);
    res.status(500).send("Error submitting user answers");
  });
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
  const tx_1 = await client.transaction(serverPubKey, async () => {
    await examina.publishExamCorrectAnswers(examID, questions);
  });
  tx_1.transaction = tx_1.transaction?.sign(serverKey);
  await tx_1.send();
  console.log("Correct answers published");
  const tx = await client.transaction(serverPubKey, async () => {
    await examina.checkUserScore(userID, examID);
  });
  tx.transaction = tx.transaction?.sign(serverKey);
  await tx.send();
  const userScore = await client.query.runtime.Examina.userScores.get(new UserExam(examID, userID, UInt64.from(1)));
  console.log("User score calculated: ", userScore?.toJSON());
  res.json({ score: userScore ? userScore.toJSON() : "User score not found"});
});

server.get("/score/:examID/:userID", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const examID = Poseidon.hash([Field(Buffer.from(req.params.examID).toString("hex"))]);
  const userID = Poseidon.hash([Field(Buffer.from(req.params.userID).toString("hex"))]);
  const score_1 = await client.query.runtime.Examina.userScores.get(new UserExam(examID, userID, UInt64.from(1)));
  const score_0 = await client.query.runtime.Examina.userScores.get(new UserExam(examID, userID, UInt64.from(0)));
  const score_2 = await client.query.runtime.Examina.userScores.get(new UserExam(examID, userID, UInt64.from(2)));


  console.log("Score_1: ", score_1?.toJSON());
  console.log("Score_0: ", score_0?.toJSON());
  console.log("Score_2: ", score_2?.toJSON());
  res.send({ score: score_1?.toJSON() });
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

server.get("/user-exams/:examID/:userID", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const key = Poseidon.hash([Field(Buffer.from(req.params.userID).toString("hex"))]);
  const userExam: UserExam | undefined = await client.query.runtime.Examina.userExams.get(key);
  console.log("UserExam isCompleted: ", userExam?.isCompleted.toJSON());
  console.log("UserExam examID: ", userExam?.examID.toJSON());
  console.log("UserExam userID: ", userExam?.userID.toJSON());
  res.json("UserExam: " + userExam?.isCompleted.toJSON());
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