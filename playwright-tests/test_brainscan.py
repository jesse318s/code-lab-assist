# BrainScan runtime vulnerability tests
# Injects the vendored brain.js browser bundle into each live lab page,
# then runs the trained neural network entirely in the browser to scan
# the runtime content for vulnerability patterns. No external server required.
import json
from pathlib import Path
import pytest
from playwright.sync_api import Page

CRITICAL_RISK_THRESHOLD = 0.75

WORKSPACE_ROOT = Path(__file__).parent.parent
BRAIN_JS_PATH = WORKSPACE_ROOT / "brainscan" / "vendor" / "brain.js" / "browser.js"
SNAPSHOT_PATH = WORKSPACE_ROOT / "brainscan" / "data" / "trained-network.json"

LAB_DIRS = [
    "javascript-lab",
    "sql-lab",
]

@pytest.fixture(scope="session")
def brain_snapshot():
    if not SNAPSHOT_PATH.exists():
        pytest.skip("BrainScan snapshot not found — run `node index.js` in brainscan/ to generate it")

    return json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))

@pytest.mark.parametrize("lab_dir", LAB_DIRS)
def test_no_critical_vulns(serve, brain_snapshot, page: Page, lab_dir):
    url = serve(lab_dir)

    page.goto(url)
    page.wait_for_load_state("load")

    # Inject the vendored brain.js browser bundle. add_script_tag returns the
    # exact ElementHandle, so we tag it directly — no reliance on script order.
    brain_script = page.add_script_tag(path=str(BRAIN_JS_PATH))
    brain_script.evaluate("el => el.setAttribute('data-injected', 'brainscan')")

    # Run the full scan inside the browser:
    # 1. Restore the trained network from the snapshot
    # 2. Collect runtime code: rendered HTML (excluding the injected script tag)
    #    + text of all inline script elements except the brain.js bundle
    # 3. Extract binary vulnerability features using the same regexes as utils.js
    # 4. Run the neural network and return the risk score + triggered features
    result = page.evaluate("""
        (snapshot) => {
            const net = new brain.NeuralNetwork();
            net.fromJSON(snapshot);

            const labScripts = Array.from(
                document.querySelectorAll('script:not([data-injected="brainscan"])')
            );
            const scriptCode = labScripts.map(s => s.textContent).join('\\n');

            const domClone = document.documentElement.cloneNode(true);
            const injected = domClone.querySelector('script[data-injected="brainscan"]');
            if (injected) injected.remove();
            const html = domClone.outerHTML;

            const code = html + '\\n' + scriptCode;

            const features = {
                has_eval:             /\\beval\\s*\\(/.test(code) ? 1 : 0,
                has_inner_html:       /\\.innerHTML\\s*=/.test(code) ? 1 : 0,
                has_document_write:   /document\\.write\\s*\\(/.test(code) ? 1 : 0,
                has_sql:              /\\b(SELECT\\s+.+\\s+FROM|INSERT\\s+INTO|UPDATE\\s+.+\\s+SET|DELETE\\s+FROM)\\b/i.test(code) ? 1 : 0,
                has_exec:             /\\b(exec|execSync|spawn|spawnSync)\\s*\\(/.test(code) ? 1 : 0,
                has_unvalidated_input:/req\\.(body|params|query)\\s*[\\[.]/.test(code) ? 1 : 0,
                has_dynamic_import:   /require\\s*\\(\\s*(?!['"`])/.test(code) || /import\\s*\\(\\s*(?!['"`])/.test(code) ? 1 : 0,
                has_http_request:     /https?:\\/\\//.test(code) || /\\b(fetch|axios\\.(get|post|put|delete)|http\\.get|https\\.get)\\s*\\(/.test(code) ? 1 : 0,
            };

            const output = net.run(features);
            const risk = output.risk;
            const riskPercent = Math.round(risk * 100);

            return { risk, riskPercent, features };
        }
    """, brain_snapshot)

    triggered = [k for k, v in result["features"].items() if v == 1]

    assert result["risk"] < CRITICAL_RISK_THRESHOLD, (
        f"[{lab_dir}] BrainScan Critical Risk ({result['riskPercent']}%). "
        f"Triggered features: {triggered}"
    )
