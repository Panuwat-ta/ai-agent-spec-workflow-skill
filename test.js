const content = `# Req

bla

---

<details>
<summary>Project Context</summary>

Blah
</details>
`;
const stripped = content.replace(/---\s*<details>[\s\S]*?<\/details>\s*$/g, '').trim();
console.log('STRIPPED: ' + stripped);
