/* Everything on the install page that changes when the server gets a public address.
   diaChiWeb — the web app's public address (https://…, no trailing slash). EMPTY until the
   server has a domain: the page then shows "Sắp có" and names no address. Never put the home
   network's IP here — the page is public, and scripts/trang_cong_khai.py refuses it. When the
   domain exists, set it here and run ./scripts/dang_trang.sh.
   kho — the public repo whose releases the page reads; the release workflow publishes to
   the same one (VE_KHO_CONG_KHAI in .github/workflows/phat-hanh.yml, kept equal by a test). */
window.CAU_HINH = Object.freeze({
  kho: "shan369rpa/speaking-releases",
  diaChiWeb: "",
});
