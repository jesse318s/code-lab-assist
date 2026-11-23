# HMAC sealing for case manifests using a local or environment-supplied key.
import hmac
import os
from hashlib import sha256
from pathlib import Path

from .utils import TOOL_VERSION, canonical_json_bytes

DEFAULT_KEY_PATH = Path(__file__).resolve().parent / "case-signing.key"


def load_signing_key(key_path: Path | None = None) -> bytes:
    """Load the HMAC key, generating a local default key on first use.

    Args:
        key_path: Optional explicit key file; overrides the environment and default.
    """
    if key_path is not None: return key_path.read_bytes()

    env_key = os.environ.get("FORENSICS_SIGNING_KEY")

    if env_key is not None: return env_key.encode("utf-8")

    if not DEFAULT_KEY_PATH.exists():
        DEFAULT_KEY_PATH.write_bytes(os.urandom(32))
        DEFAULT_KEY_PATH.chmod(0o600)

    return DEFAULT_KEY_PATH.read_bytes()


def key_fingerprint(key: bytes) -> str:
    return sha256(key).hexdigest()


def seal_manifest(manifest: dict, key: bytes, examiner: str, command_line: str) -> dict:
    """Add provenance metadata and an HMAC-SHA256 seal to a manifest."""
    sealed = dict(manifest)
    sealed.update({
        "tool_version": TOOL_VERSION,
        "command_line": command_line,
        "hash_algorithm": "sha256",
        "signature_algorithm": "HMAC-SHA256",
        "signed_by": examiner,
        "signing_key_fingerprint": key_fingerprint(key),
    })

    signature = hmac.new(key, canonical_json_bytes(sealed), sha256).hexdigest()
    sealed["signature"] = signature

    return sealed


def verify_manifest_signature(manifest: dict, key: bytes) -> list[str]:
    """Verify a sealed manifest and return any signature problems."""
    signature = manifest.get("signature")

    if not signature: return ["manifest is not signed"]

    expected_key_fingerprint = manifest.get("signing_key_fingerprint")

    if expected_key_fingerprint != key_fingerprint(key): return ["signing key fingerprint mismatch"]

    unsigned = dict(manifest)
    unsigned.pop("signature", None)
    expected = hmac.new(key, canonical_json_bytes(unsigned), sha256).hexdigest()

    if not hmac.compare_digest(signature, expected): return ["manifest signature mismatch"]

    return []
