# _order.txt の各行に、正規表現に合うファイルだけ late を付ける（試行用）
import sys,re
p=sys.argv[1]; rx=re.compile(sys.argv[2]); ex=re.compile(sys.argv[3]) if len(sys.argv)>3 else None
out=[]
for l in open(p,encoding='utf-8').read().split('\n'):
    t=l.strip()
    if not t or t.startswith('#'): out.append(l); continue
    f=t.replace('late ','').strip()
    late = bool(rx.search(f)) and not (ex and ex.search(f))
    out.append(('late ' if late else '')+f)
open(p,'w',encoding='utf-8').write('\n'.join(out))
