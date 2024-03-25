import { Field, Experimental, SelfProof, Provable, Struct, Poseidon, Int64, UInt64 } from 'o1js';
import { UInt240 } from "./UInt240.js"

const 
    INITIAL_INDEX = 0,
    INITIAL_CORRECTS = 0,
    INITIAL_INCORRECTS = 0,
    BLANK_VALUE = 0,
    INCREMENT = 1;

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
            method(secureHash: Field, answer: Field, userAnswer: Field, index: Field) {
                index.assertEquals(INITIAL_INDEX);
                secureHash.assertEquals(Poseidon.hash([answer, userAnswer, index]));
                return new PublicOutputs(UInt240.from(INITIAL_CORRECTS), UInt240.from(INITIAL_INCORRECTS));
            },
        },

        calculate: {
            privateInputs: [SelfProof, Field, Field, Field],

            method (
                secureHash: Field,
                earlierProof: SelfProof<Field, PublicOutputs>,
                answer: Field,
                userAnswer: Field,
                index: Field
            ) { 
                earlierProof.verify();
                
                earlierProof.publicInput.assertEquals(Poseidon.hash([answer, userAnswer, index.sub(1)]));
                secureHash.assertEquals(Poseidon.hash([answer, userAnswer, index]));
                const equation = answer.equals(BLANK_VALUE).not().and(answer.equals(userAnswer));
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