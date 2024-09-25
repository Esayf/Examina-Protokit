import { Struct, Field, Poseidon, PublicKey, UInt64 } from 'o1js';
export class Controller extends Struct({
    secureHash: Field,
    answers: Field,
    userAnswers: Field,
    index: Field,
    examID: Field,
    userID: Field
}) {
    constructor (secureHash: Field, answers: Field, userAnswers: Field, index: Field, examID: Field, userID: Field) {
        super({secureHash, answers, userAnswers, index, examID, userID});
        this.secureHash = secureHash;
        this.answers = answers;
        this.userAnswers = userAnswers;
        this.index = index;
        this.examID = examID;
        this.userID = userID;
    }

    hash() {
        return Poseidon.hash([this.answers, this.userAnswers, this.index]);
    }

    userAnswersHash(publicKey: PublicKey) {
        return Poseidon.hash(publicKey.toFields().concat(this.userAnswers));
    }
}