import { Balance, VanillaRuntimeModules } from "@proto-kit/library";
import { ModulesConfig } from "@proto-kit/common";
import { Balances } from "@proto-kit/library";
import { Examina } from "./modules/Examina";
import { Field, UInt64 } from "o1js";

const modules = {
  Examina,
  Balances
};

const config: ModulesConfig<typeof modules> = {
  Examina: {
    incorrectToCorrectRatio: Field(0),
  },
  Balances: {
    totalSupply: UInt64.from(10000),
  },
};

export default {
  modules,
  config,
};
