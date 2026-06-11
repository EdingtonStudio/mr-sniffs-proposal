/* Mr. Sniffs — deal calculator.
   All math is here, all client-side, nothing leaves the page.

   Model:
   - During recoup, Teddy's monthly take = retainer + lean% of distributable profit.
   - His lean share fills the Build Pool (default 1.5x the Founder's Advance).
   - Chris's Advance repays out of Chris's (100 - lean)% in parallel.
   - Long-stop: the lean ends at month 30 no matter what.
   - Steady state: retainer + 50% of profit.
   - Exit: 50% of net proceeds after unreturned capital (assumed fully returned by then).
   - Timeline strip assumes an illustrative sale at month 36.
*/

(function () {
  "use strict";

  var LONG_STOP = 30;        // months, the lean cannot run past this
  var SALE_MONTH = 36;       // illustrative sale month for the cumulative strip

  function $(id) { return document.getElementById(id); }
  function num(el) { var v = parseFloat(el.value); return isFinite(v) && v >= 0 ? v : 0; }

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  function compact(n) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + "M";
    if (n >= 1e3) return "$" + Math.round(n / 1e3) + "K";
    return money(n);
  }

  var els = {
    advance: $("in-advance"),
    poolmult: $("in-poolmult"),
    lean: $("in-lean"),
    retainer: $("in-retainer"),
    profit: $("in-profit"),
    exit: $("in-exit")
  };

  function update() {
    var advance = num(els.advance);
    var poolMult = parseFloat(els.poolmult.value);
    var pool = advance * poolMult;
    var lean = parseInt(els.lean.value, 10);          // Teddy's % during recoup
    var retainer = num(els.retainer);
    var profit = num(els.profit);
    var exit = num(els.exit);

    // Input labels
    $("lab-poolmult").textContent = poolMult + "x \u00B7 " + money(pool);
    $("lab-lean").textContent = lean + " / " + (100 - lean) + " to Giard";
    $("lab-profit").textContent = money(profit) + "/mo";
    $("lab-exit").textContent = "$" + (exit / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";

    // During recoup: retainer + lean% of profit
    var leanShare = (lean / 100) * profit;
    var recoupTake = retainer + leanShare;
    $("out-recoup").innerHTML = money(recoupTake) + "<small>/mo</small>";
    $("f-recoup").textContent = "= retainer + " + lean + "% \u00D7 profit";

    // Months to fill the pool, capped by the long-stop
    var rawMonths = leanShare > 0 ? pool / leanShare : Infinity;
    var months = Math.ceil(rawMonths);
    var capped = months > LONG_STOP || !isFinite(months);
    var effMonths = capped ? LONG_STOP : months;

    if (!isFinite(months)) {
      $("out-months").textContent = "No profit yet";
      $("f-months").textContent = "= pool \u00F7 (" + lean + "% \u00D7 monthly profit) \u00B7 set a profit above zero";
    } else if (capped) {
      $("out-months").textContent = LONG_STOP + "+ months";
      $("f-months").textContent = "= " + money(pool) + " \u00F7 " + money(leanShare) + "/mo \u00B7 long-stop converts to 50/50 at month " + LONG_STOP;
    } else {
      $("out-months").textContent = months + (months === 1 ? " month" : " months");
      $("f-months").textContent = "= " + money(pool) + " \u00F7 " + money(leanShare) + "/mo \u00B7 long-stop at month " + LONG_STOP;
    }
    $("out-poolbar").style.width = Math.min(100, (effMonths / LONG_STOP) * 100) + "%";

    // Steady state: retainer + 50%
    var steadyTake = retainer + 0.5 * profit;
    $("out-steady").innerHTML = money(steadyTake) + "<small>/mo</small>";

    // Exit: 50% of net proceeds (Advance assumed fully returned by then)
    var exitCut = 0.5 * exit;
    $("out-exit").textContent = "$" + (exitCut / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";

    // Cumulative strip (illustrative sale at SALE_MONTH)
    var banked = Math.min(pool, leanShare * effMonths);
    var recoupCum = retainer * effMonths + banked;
    var normMonths = Math.max(0, SALE_MONTH - effMonths);
    var normCum = recoupCum + steadyTake * normMonths;
    var exitCum = normCum + exitCut;

    $("tl-recoup-t").textContent = "Recoup \u00B7 " + effMonths + " mo";
    $("tl-recoup-c").textContent = compact(recoupCum) + " banked";
    $("tl-norm-t").textContent = "Normalize \u00B7 " + normMonths + " mo";
    $("tl-norm-c").textContent = compact(normCum);
    $("tl-exit-c").textContent = compact(exitCum);

    // Segment widths: proportional to months, exit gets a fixed slice
    var total = SALE_MONTH;
    $("seg-recoup").style.width = Math.max(14, (effMonths / total) * 72) + "%";
    $("seg-norm").style.width = Math.max(14, (normMonths / total) * 72) + "%";
    $("seg-exit").style.width = "28%";
  }

  // Retainer tier table: Edington runs at roughly half of Giard
  function updateTiers() {
    var giard = document.querySelectorAll(".tier-g");
    var edington = document.querySelectorAll("[data-e]");
    giard.forEach(function (input, i) {
      var v = parseFloat(input.value);
      edington[i].textContent = isFinite(v) && v >= 0 ? money(v / 2) : "\u2014";
    });
  }

  Object.keys(els).forEach(function (k) {
    els[k].addEventListener("input", update);
  });
  document.querySelectorAll(".tier-g").forEach(function (input) {
    input.addEventListener("input", updateTiers);
  });

  // Redlines: open the partner's email app with the proposed changes prefilled
  var sendBtn = $("suggest-send");
  if (sendBtn) {
    sendBtn.addEventListener("click", function () {
      var text = $("suggest-text").value.trim();
      var subject = "Mr. Sniffs proposal \u00B7 proposed changes";
      var body = text || "(Write your proposed changes here.)";
      window.location.href = "mailto:Chris@Edington.co?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  update();
  updateTiers();
})();
