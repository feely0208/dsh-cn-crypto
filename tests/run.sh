#!/bin/bash
# 双向验证：正例必须每条规则都报，反例必须 0 命中（误报是安全工具的头号杀手）
set -uo pipefail
export PATH="/usr/local/bin:$PATH"
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
ok(){ echo "  ✅ $1"; PASS=$((PASS+1)); }
bad(){ echo "  ❌ $1"; FAIL=$((FAIL+1)); }
echo ""; echo "  @deepwhale-cn/dsh-cn-crypto · 双向验证"
echo "  ────────────────────────────────────────────────"

RULES="CRYPTO-ECB CRYPTO-WEAK-HASH CRYPTO-RSA-KEYLEN CRYPTO-HARDCODED-IV CRYPTO-NO-SM"

# ── ① 正例：每条规则都必须报出来（报不出 = 死规则）─────────────
echo ""; echo "  【正例】tests/fixtures/fail/demo-project（应当全部报出）"
J=$(node bin/cli.mjs --root tests/fixtures/fail/demo-project --json 2>&1)
for rid in $RULES; do
  c=$(echo "$J" | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
    print(len([f for f in d.get('findings',[]) if f.get('ruleId')=='$rid']))
except Exception: print(0)" 2>/dev/null)
  [ "${c:-0}" -gt 0 ] && ok "$rid 报出（$c 处）" || bad "$rid 未报出"
done

# ── ② 反例一：用了 SM4-CBC 的正常项目 → 0 命中 ────────────────
echo ""; echo "  【反例 1】tests/fixtures/pass/clean-project（国密正常项目，应当 0 命中）"
M=$(node bin/cli.mjs --root tests/fixtures/pass/clean-project --quiet 2>&1 | grep -oE '^[0-9]+' | head -1)
[ "${M:-1}" = "0" ] && ok "SM4-CBC/SM3/SM2 项目 0 命中" || bad "误报 ${M} 条"
CNA=$(node bin/cli.mjs --root tests/fixtures/pass/clean-project --json 2>&1 | python3 -c "
import json,sys
try: print(','.join((json.load(sys.stdin).get('stats') or {}).get('notApplicable') or []))
except Exception: print('?')" 2>/dev/null)
[ -z "$CNA" ] && ok "国密项目上 5 条规则全部运行（未被 when 误挡）" || bad "规则被 when 误挡：$CNA"

# ── ③ 反例二：完全不涉及密码的项目 → when 必须全部生效 ────────
echo ""; echo "  【反例 2】tests/fixtures/pass/no-crypto-project（无密码学代码）"
N=$(node bin/cli.mjs --root tests/fixtures/pass/no-crypto-project --quiet 2>&1 | grep -oE '^[0-9]+' | head -1)
[ "${N:-1}" = "0" ] && ok "无密码项目 0 命中" || bad "误报 ${N} 条"
NN=$(node bin/cli.mjs --root tests/fixtures/pass/no-crypto-project --json 2>&1 | python3 -c "
import json,sys
try: print(','.join((json.load(sys.stdin).get('stats') or {}).get('notApplicable') or []))
except Exception: print('')" 2>/dev/null)
for rid in $RULES; do
  echo "$NN" | grep -q "$rid" && ok "无密码项目：$rid 判为不适用（when 生效）" || bad "$rid 在无密码项目上仍然运行（when 没生效）"
done

# ── ④ 溯源 + 条件性：必须带 source（引标准/法规）且必须带 when ──
echo ""; echo "  【溯源 + 条件性】每条规则都要引得到标准/法规，且用 when 限定适用范围"
python3 - <<'PY' && ok "5 条规则均带 source（引标准/法规）且带 when" || bad "有规则缺 source 标准引用或缺 when"
import json, glob, sys
bad = False
n = 0
for f in sorted(glob.glob('rules/*.json')):
    r = json.load(open(f, encoding='utf-8'))
    rid = r.get('id')
    s = r.get('source', '')
    if not s:
        print('  缺 source:', rid, file=sys.stderr); bad = True
    elif not any(k in s for k in ('GB/T', 'GM/T', '密码法', 'OWASP', '法》')):
        print('  未引标准/法规:', rid, file=sys.stderr); bad = True
    chk = r.get('check', {})
    if not chk.get('when'):
        print('  缺 when（条件性要求必须限定）:', rid, file=sys.stderr); bad = True
    # exts 不带点 = 死规则（本项目最怕的假绿）
    for x in (chk.get('exts') or []):
        if not str(x).startswith('.'):
            print('  exts 不带点（死规则）:', rid, x, file=sys.stderr); bad = True
    n += 1
print(f'  （已核对 {n} 条规则）')
sys.exit(1 if bad else 0)
PY

echo ""; echo "  ────────────────────────────────────────────────"
echo "  通过 $PASS · 失败 $FAIL"; echo ""
[ "$FAIL" -eq 0 ] || exit 1
