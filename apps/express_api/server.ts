import express, { Express, Request, Response } from "express";
import { client } from "chain";
import {Exam120,} from "chain/dist/Examina";
import { Field, PrivateKey, UInt64 } from "o1js";
const server = express();
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
  res.send("Hello World!");
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
  res.send("Exam created");
  } catch (error) {
    console.error(error);
    res.send("Error creating exam");
  }
  
});

server.get("/exams/:examID", async (req, res) => {
  const examina = client.runtime.resolve("Examina");
  const key = Field(req.params.examID);
  const exam = await client.query.runtime.Examina.exams.get(key);
  res.send("Exam: " + exam);
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});