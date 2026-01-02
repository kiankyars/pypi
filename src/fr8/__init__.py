from fr8.location import fr8_location
import argparse

def main():
    parser = argparse.ArgumentParser(description="Calculate your distance from fr8.")
    parser.add_argument("address", help="Address to calculate distance from")
    args = parser.parse_args()
    return fr8_location(args.address)