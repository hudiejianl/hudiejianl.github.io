(function () {
    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    function init() {
        var wrap = document.getElementById("reading-progress");
        if (!wrap) return;

        var bar = wrap.querySelector(".reading-progress-bar");
        if (!bar) return;

        var color = wrap.dataset.color || "#37c6c0";
        var height = parseInt(wrap.dataset.height || "5", 10);
        if (isNaN(height) || height <= 0) height = 5;

        wrap.style.height = height + "px";
        bar.style.height = height + "px";
        bar.style.backgroundColor = color;

        var ticking = false;

        function update() {
            ticking = false;

            var doc = document.documentElement;
            var scrollTop = window.pageYOffset || doc.scrollTop || 0;

            var article = document.querySelector(".article-main") || document.querySelector(".article");
            if (!article) return;

            var rect = article.getBoundingClientRect();
            var articleTop = rect.top + scrollTop;
            var articleHeight = article.scrollHeight || article.offsetHeight || 0;
            var viewportHeight = window.innerHeight || doc.clientHeight || 0;

            var start = articleTop;
            var end = articleTop + articleHeight - viewportHeight;

            if (end <= start) {
                bar.style.width = "100%";
                return;
            }

            var p = (scrollTop - start) / (end - start);
            p = clamp(p, 0, 1);
            bar.style.width = (p * 100).toFixed(4) + "%";
        }

        function onScroll() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(update);
        }

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
