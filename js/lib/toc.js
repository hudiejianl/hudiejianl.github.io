mixins.toc = {
    created() {
        this.renderers.push(this.initTocSpy);
    },
    methods: {
        initTocSpy() {
            const toc = document.getElementById("toc");
            if (!toc) return;
            if (toc.dataset && toc.dataset.pxTocSpy === "1") return;
            if (toc.dataset) toc.dataset.pxTocSpy = "1";

            toc.classList.add("px-toc");

            const links = [...toc.querySelectorAll('a[href^="#"]')];
            if (links.length === 0) return;

            const headings = [...document.querySelectorAll(
                ".article .content h1, .article .content h2, .article .content h3, .article .content h4, .article .content h5, .article .content h6"
            )];
            const headingById = new Map();
            for (const h of headings) {
                if (h && h.id) headingById.set(h.id, h);
            }

            const rootList = toc.querySelector("ol, ul");
            if (!rootList) return;

            const getDepth = (li) => {
                let depth = 0;
                let p = li;
                while (p && p !== toc) {
                    if (p.tagName === "OL" || p.tagName === "UL") depth++;
                    p = p.parentElement;
                }
                return depth;
            };

            const decorate = () => {
                const items = [...toc.querySelectorAll("li")];
                for (const li of items) {
                    li.classList.add("px-toc-item");
                    const depth = getDepth(li);
                    li.dataset.pxTocDepth = String(depth);

                    const childList = li.querySelector(":scope > ol, :scope > ul");
                    if (childList) {
                        childList.classList.add("px-toc-children");
                        li.classList.add("px-toc-parent");
                        if (!li.querySelector(":scope > button.px-toc-toggle")) {
                            const btn = document.createElement("button");
                            btn.type = "button";
                            btn.className = "px-toc-toggle";
                            btn.setAttribute("aria-label", "Toggle section");
                            btn.addEventListener("click", (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                li.classList.toggle("px-toc-collapsed");
                            });
                            li.insertBefore(btn, li.firstChild);
                        }
                    }
                }

                for (const li of items) {
                    const depth = Number(li.dataset.pxTocDepth || "0");
                    if (li.classList.contains("px-toc-parent") && depth >= 2) {
                        li.classList.add("px-toc-collapsed");
                    }
                }
            };

            const expandTo = (linkEl) => {
                if (!linkEl) return;
                let cur = linkEl.closest("li");
                while (cur && cur !== toc) {
                    if (cur.classList && cur.classList.contains("px-toc-parent")) {
                        cur.classList.remove("px-toc-collapsed");
                    }
                    cur = cur.parentElement ? cur.parentElement.closest("li") : null;
                }
            };

            decorate();

            const getTargetIdFromLink = (a) => {
                if (!a) return "";
                const href = a.getAttribute("href") || "";
                if (!href.startsWith("#")) return "";
                const raw = href.slice(1);
                try {
                    return decodeURIComponent(raw);
                } catch {
                    return raw;
                }
            };

            const setActive = (id) => {
                let activeLink = null;
                for (const a of links) {
                    const aid = getTargetIdFromLink(a);
                    if (aid && aid === id) {
                        a.classList.add("active");
                        activeLink = a;
                    } else a.classList.remove("active");
                }
                if (activeLink) expandTo(activeLink);
            };

            const computeCurrent = () => {
                const offset = 120;
                let currentId = "";
                for (const h of headings) {
                    if (!h || !h.id) continue;
                    const top = h.getBoundingClientRect().top;
                    if (top - offset <= 0) currentId = h.id;
                    else break;
                }
                if (!currentId) {
                    for (const a of links) {
                        const id = getTargetIdFromLink(a);
                        if (id && headingById.has(id)) {
                            currentId = id;
                            break;
                        }
                    }
                }
                if (currentId) setActive(currentId);
            };

            let ticking = false;
            const onScroll = () => {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    computeCurrent();
                    ticking = false;
                });
            };

            window.addEventListener("scroll", onScroll, { passive: true });
            onScroll();
        },
    },
};
