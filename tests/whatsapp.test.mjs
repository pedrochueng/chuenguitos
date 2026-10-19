// Rodar: node tests/whatsapp.test.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const ctx = vm.createContext({});
for (const f of ["dados.js", "script.js"]) vm.runInContext(readFileSync(new URL(`../${f}`, import.meta.url), "utf8"), ctx);
const linkWhatsApp = vm.runInContext("linkWhatsApp", ctx);
const especialidadesAtivas = vm.runInContext("especialidadesAtivas", ctx);
const CLINICA = vm.runInContext("CLINICA", ctx);

const msg = "Olá! Gostaria de obter informações sobre agendamento para psicologia na clínica.";
assert.equal(
  linkWhatsApp("55 (11) 91234-5678", msg),
  "https://wa.me/5511912345678?text=Ol%C3%A1!%20Gostaria%20de%20obter%20informa%C3%A7%C3%B5es%20sobre%20agendamento%20para%20psicologia%20na%20cl%C3%ADnica."
);
assert.equal(linkWhatsApp("551134567890", "a&b=c"), "https://wa.me/551134567890?text=a%26b%3Dc");
assert.equal(linkWhatsApp("", msg), null, "número vazio não gera link");
assert.equal(linkWhatsApp("11912345678", msg), null, "sem 55 não gera link");
assert.equal(linkWhatsApp("55119", msg), null, "curto demais");
assert.equal(linkWhatsApp(undefined, msg), null);

// Array.from: arrays criados no vm têm outro protótipo e falham no deepStrictEqual
const ativas = Array.from(especialidadesAtivas(CLINICA.especialidades), (e) => e.id);
assert.deepEqual(ativas, ["psicologia"], "só psicologia ativa");
assert.equal(especialidadesAtivas([{ ativa: "true" }, { ativa: 1 }]).length, 0, "só ativa === true");

console.log("ok: todos os testes passaram");
