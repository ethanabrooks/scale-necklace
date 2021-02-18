import json
import sys
_, inpath, outpath = sys.argv

def main():
    with open(inpath, 'r') as f:
        obj = json.load(f)

    def generator(graph, **kwargs):
        for i, node in enumerate(graph):
            node['index'] = i
            yield node

    obj = list(generator(**obj))

    with open(outpath, 'w') as f:
        json.dump(obj, f)

if __name__ == '__main__':
    main()
