import { Field, UInt64 } from "o1js";
import { runtimeModule } from "@proto-kit/module";
import { Examina } from "./Examina";

export default {
  modules: {
    Examina
  },
  config: {
    Examina: {
      incorrectToCorrectRatio: Field(0),
    },
  },
};
