<script id="__probe__">
  (function () {
    function box(id) {
      var el = document.getElementById(id);
      if (!el) return null;
      var r = el.getBoundingClientRect();
      if (!r.width && !r.height) return null;
      return { x1: r.left, x2: r.right, y1: r.top, y2: r.bottom };
    }
    var out = {
      caption_plate: box("cap"),
      caption_text: box("captext"),
      overlay_rule: document.querySelector(".overlay-rule")
        ? (function () {
            var r = document.querySelector(".overlay-rule").getBoundingClientRect();
            return { x1: r.left, x2: r.right, y1: r.top, y2: r.bottom };
          })()
        : null,
      overlay_text: box("ov-text"),
      risk_caption: box("risk"),
      f5_plate: box("plate"),
      f2_caption: box("f2cap"),
      ink_meta: box("inkmeta"),
      ink_rule: box("inkrule"),
    };
    var s = document.createElement("script");
    s.id = "__probe__";
    s.type = "application/json";
    s.textContent = JSON.stringify(out);
    document.body.appendChild(s);
    var el = document.getElementById("cap");
    if (el) el.style.opacity = "1";
  })();
</script>
