import argparse, http.server
p=argparse.ArgumentParser();p.add_argument('--host', default='0.0.0.0');p.add_argument('--port',type=int,default=4173);p.add_argument('--strictPort',action='store_true');a=p.parse_args();http.server.ThreadingHTTPServer((a.host,a.port),http.server.SimpleHTTPRequestHandler).serve_forever()
