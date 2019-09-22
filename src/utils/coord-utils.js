import {isEqual} from "lodash";

/**
 * @typedef {[number, number]} Coord
 */

/**
 * Curried function to check if two coordinates are equal.
 * @param {Coord} coord1
 * @returns {function(*=): boolean}
 */
export const equalsCoord = coord1 => coord2 => isEqual(coord1, coord2);

/**
 * Returns all the neighbours of a coordinate.
 * @param {Coord} coord
 * @param boardSize Optional.
 * @returns {Coord[]}
 */
export const coordNeighbours = ([row, col], boardSize = Infinity) => {
  const possibleNeighbours = [
    [row - 1, col - 1],
    [row - 1, col],
    [row - 1, col + 1],
    [row, col - 1],
    [row, col + 1],
    [row + 1, col - 1],
    [row + 1, col],
    [row + 1, col + 1],
  ];
  return possibleNeighbours.filter(([row, col]) =>
    row >= 0
    && col >= 0
    && row < boardSize
    && col < boardSize
  );
};

/**
 * Checks if two coordinates are neighbours
 * @param {Coord} coord1
 * @param {Coord} coord2
 * @returns {boolean}
 */
export const coordsAreNeighbours = (coord1, coord2) => {
  return !!coordNeighbours(coord1).find(equalsCoord(coord2));
};
