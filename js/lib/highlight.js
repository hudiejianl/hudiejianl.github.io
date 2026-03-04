mixins.highlight = {
    data() {
        return { copying: false };
    },
    created() {
        hljs.configure({ ignoreUnescapedHTML: true });
        this.renderers.push(this.highlight);
    },
    methods: {
        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        highlight() {
            let codes = document.querySelectorAll("pre");
            for (let i of codes) {
                try {
                    if (i.dataset && i.dataset.pxHighlighted === "1") continue;
                    if (i.querySelector && i.querySelector(".code-content")) {
                        if (i.dataset) i.dataset.pxHighlighted = "1";
                        continue;
                    }

                    let code = i.textContent;

                    let language = "plaintext";
                    let codeEl = i.querySelector ? i.querySelector("code") : null;
                    if (codeEl && codeEl.classList) {
                        let langClass = [...codeEl.classList].find((c) => c.startsWith("language-"));
                        if (langClass) language = langClass.replace("language-", "");
                        else if (codeEl.classList.length > 0) language = codeEl.classList[0];
                    } else if (i.classList && i.classList.length > 0) {
                        language = i.classList[0];
                    }

                    let highlighted;
                    try {
                        highlighted = hljs.highlight(code, { language }).value;
                    } catch {
                        highlighted = code;
                        language = "plaintext";
                    }

                    i.innerHTML = `
                <div class="code-content hljs">${highlighted}</div>
                <div class="language">${language}</div>
                <div class="copycode">
                    <i class="fa-solid fa-copy fa-fw"></i>
                    <i class="fa-solid fa-check fa-fw"></i>
                </div>
                `;
                    if (i.dataset) i.dataset.pxHighlighted = "1";
                    let content = i.querySelector(".code-content");
                    if (content && hljs.lineNumbersBlock) hljs.lineNumbersBlock(content, { singleLine: true });
                    let copycode = i.querySelector(".copycode");
                    if (!copycode) continue;
                    copycode.addEventListener("click", async () => {
                        if (this.copying) return;
                        this.copying = true;
                        copycode.classList.add("copied");
                        await navigator.clipboard.writeText(code);
                        await this.sleep(1000);
                        copycode.classList.remove("copied");
                        this.copying = false;
                    });
                } catch {
                    if (i.dataset) i.dataset.pxHighlighted = "1";
                    continue;
                }
            }
        },
    },
};
