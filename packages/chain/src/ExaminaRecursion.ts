import { Field, Experimental, SelfProof, Provable, Struct, Poseidon, Int64 } from 'o1js';
import { UInt240 } from "./UInt240.js"

const 
    INDEX_MULTIPLIER = 10,
    INITIAL_CORRECTS = 0,
    INITIAL_INCORRECTS = 0,
    BLANK_VALUE = 0,
    INCREMENT = 1,
    ANSWER_DIVISOR = UInt240.from(10n)
;

export class PublicOutputs extends Struct({
    corrects: UInt240,
    incorrects: UInt240
}) {
    constructor(corrects: UInt240, incorrects: UInt240) {
        super({
            corrects,
            incorrects
        })

        this.corrects = corrects;
        this.incorrects = incorrects;
    }
    
    correct() {
        this.corrects = this.corrects.add(INCREMENT);
        return new PublicOutputs(this.corrects, this.incorrects);
    }

    incorrect() {
        this.incorrects = this.incorrects.add(INCREMENT);
        return new PublicOutputs(this.corrects, this.incorrects);
    }
}

export const CalculateScore = Experimental.ZkProgram({
    name: "calculate-score",
    publicInput: Field,
    publicOutput: PublicOutputs,

    methods: {
        baseCase: {
            privateInputs: [Field, Field, Field],

            method(secureHash: Field, answers: Field, userAnswers: Field, index: Field) {
                index.mul(INDEX_MULTIPLIER).assertEquals(1);
                secureHash.assertEquals(Poseidon.hash([answers, userAnswers, index]));

                return new PublicOutputs(UInt240.from(INITIAL_CORRECTS), UInt240.from(INITIAL_INCORRECTS));
            },
        },

        calculate: {
            privateInputs: [SelfProof, Field, Field, Field],

            method (
                secureHash: Field,
                earlierProof: SelfProof<Field, PublicOutputs>,
                answers: Field,
                userAnswers: Field,
                index: Field
            ) { 
                earlierProof.verify();
                
                earlierProof.publicInput.assertEquals(Poseidon.hash([answers, userAnswers, index.div(INDEX_MULTIPLIER)]));
                secureHash.assertEquals(Poseidon.hash([answers, userAnswers, index]));

                
            
                const publicOutputs = earlierProof.publicOutput;

                const i = UInt240.from(index);

                const a = UInt240.from(answers);
                const ua = UInt240.from(userAnswers);

                const remainderOfAnswers = a.div(i).mod(ANSWER_DIVISOR).toField();
                const remainderOfUserAnswers = ua.div(i).mod(ANSWER_DIVISOR).toField();

                const equation = remainderOfAnswers.equals(BLANK_VALUE).not().and(remainderOfAnswers.equals(remainderOfUserAnswers));

                const newPublicOutput = Provable.if (
                    equation,
                    PublicOutputs,
                    new PublicOutputs(earlierProof.publicOutput.corrects.add(1), earlierProof.publicOutput.incorrects),
                    new PublicOutputs(earlierProof.publicOutput.corrects, earlierProof.publicOutput.incorrects.add(1)),
                );
                return new PublicOutputs(newPublicOutput.corrects, newPublicOutput.incorrects);
            },
        },
    },
});