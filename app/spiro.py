import sys
import numpy as np
import json
import argparse


def parseoptions():
    usage = "usage: %prog [options]"
    parser = argparse.ArgumentParser(usage=usage)

    parser.add_argument('--infile',
                    help='JSON file containing simulation inputs.',
                    action='store',
                    dest='infile',
                    default='spiro.in',
                    type=str)

    parser.add_argument('--outfile',
                    help='JSON file containing simulation outputs.',
                    action='store',
                    dest='outfile',
                    default='spiro.out',
                    type=str)

    parser.add_argument('--use-stdstreams',
                    help='Send input and output through standard input and output streams.',
                    action='store_true',
                    dest='usestdstreams',
                    default=False)


    parser.add_argument('remainder', nargs=argparse.REMAINDER)

    options = parser.parse_args()

    return options,options.remainder


def spiro(n1,n2,n3):
    t = np.linspace(0,1,1000);
    z = np.exp(1j*2*np.pi*n1*t) + np.exp(1j*2*np.pi*n2*t) + np.exp(1j*2*np.pi*n3*t)
    return (np.real(z),np.imag(z))


if __name__ == "__main__":

    # parse command line options
    options,remainder = parseoptions()

    # set defaults
    n1 = 0
    n2 = 0
    n3 = 0

    # read inputs
    if options.usestdstreams:
        data = json.load(sys.stdin)
    else:
        with open(options.infile, "r") as infile:
            data = json.load(infile)

    n1 = data['inputs']['n1']
    n2 = data['inputs']['n2']
    n3 = data['inputs']['n3']

    # run the simulation
    (x,y) = spiro(n1,n2,n3)

    # write outputs
    data['outputs'] = {
        'x': x.tolist(),
        'y': y.tolist()
    }

    if options.usestdstreams:
        json.dump(data,sys.stdout)
    else:
        with open(options.outfile, "w") as outfile:
            json.dump(data,outfile)
        print options.outfile
