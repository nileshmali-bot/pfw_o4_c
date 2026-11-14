// Optional Vercel function: same-site relay for AMFI NAV history, used only if the browser
// cannot call api.mfapi.in directly. Only the six scheme codes the app needs are allowed.
const ALLOWED = new Set(["100822", "105085", "115744", "140088", "100369", "100868"]);

module.exports = async (req, res) => {
  const code = String((req.query && req.query.code) || "");
  if (!ALLOWED.has(code)) { res.status(400).json({ error: "scheme code not allowed" }); return; }
  try {
    const r = await fetch("https://api.mfapi.in/mf/" + code);
    if (!r.ok) throw new Error("upstream HTTP " + r.status);
    const body = await r.text();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=43200, stale-while-revalidate=86400");
    res.status(200).send(body);
  } catch (e) {
    res.status(502).json({ error: String((e && e.message) || e) });
  }
};
