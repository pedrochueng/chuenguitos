// Rodar: node tests/whatsapp.test.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const ctx = vm.createContext({});
for (const f of ["dados.js", "script.js"]) vm.runInContext(readFileSync(new URL(`../${f}`, import.meta.url), "utf8"), ctx);
const linkWhatsApp = vm.runInContext("linkWhatsApp", ctx);
const especialidadesVisiveis = vm.runInContext("especialidadesVisiveis", ctx);
const profissionalDe = vm.runInContext("profissionalDe", ctx);
const CLINICA = vm.runInContext("CLINICA", ctx);
const montarMailto = vm.runInContext("montarMailto", ctx);

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
const ids = (modo) => Array.from(especialidadesVisiveis(CLINICA.especialidades, modo), (e) => e.id);
assert.deepEqual(ids(false), ["psicologia"], "publicado: só psicologia ativa");
assert.equal(ids(true).length, 5, "apresentação: mostra os exemplos");
assert.equal(especialidadesVisiveis([{ ativa: "true" }, { ativa: 1 }], false).length, 0, "só ativa === true");

// Sem modo de apresentação, nenhum profissional fictício aparece
for (const esp of CLINICA.especialidades) {
  const p = profissionalDe(esp, false);
  assert.ok(p === null || p.exemplo === false, `${esp.id}: exemplo vazou com modo desligado`);
}
assert.equal(profissionalDe(CLINICA.especialidades[0], true).exemplo, true);
assert.equal(profissionalDe({ profissional: { nome: "Real" }, profissionalExemplo: { nome: "X" } }, true).nome, "Real", "real tem prioridade");

// mailto: codificação, quebras de linha e destinatário único
const m = montarMailto("a@b.com", "Ana & Cia", "linha 1\nlinha 2?x=1");
assert.ok(m.startsWith("mailto:a@b.com?subject=Contato%20pelo%20site&body="));
assert.ok(m.includes("linha%201%0D%0Alinha%202%3Fx%3D1"), "CRLF e ? codificados");
assert.ok(m.includes("Ana%20%26%20Cia"), "& do nome codificado");
assert.equal(montarMailto("", "a", "b"), null);
assert.equal(montarMailto("sem-arroba", "a", "b"), null);
assert.equal(montarMailto("a@b.com,outro@x.com", "a", "b"), null, "vários destinatários");
assert.equal(montarMailto("a@b.com?bcc=x@y.com", "a", "b"), null, "não injeta cabeçalhos");

console.log("ok: todos os testes passaram");
