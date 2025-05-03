'use strict';
import * as fs from 'fs';
import * as path from 'path';
import IGCParser from 'igc-parser';
import {solver, scoringRules} from '../index.js';

const options = {
    maxcycle: 100, // max execution time per cycle in milliseconds
    noflight: false, // do not include the flight track in the geojson output
    invalid: false, // do not filter invalid GPS fixes
    hp: true, // High Precision mode, use Vincenty's instead of FCC distances, twice slower for a little bit better precision
    trim: true // auto-trim the flight to its launch and landing points
};

const MAX_EXECUTION_TIME_SECONDS = 60;

const flight = IGCParser.parse(fs.readFileSync(path.join('test', 'xeronimus_test_triangle.igc'), 'utf8'), {lenient: true});
const it = solver(flight, scoringRules.XContest, options);
let best;
const tEnd = Date.now() + MAX_EXECUTION_TIME_SECONDS * 1000;

/*
   * BEWARE!
   * In JS generators a for..of loop will ignore the closing return value of the generator. do not use a for..of loop!
   * This is the only type of loop that works:
   */
let newbest;
do {
    newbest = it.next();
    if (best === undefined || newbest.value.id !== best?.id) {
        best = newbest.value;
    }

    if (Date.now() > tEnd) {
        console.warn('max execution time reached, no optimal solution found\r');
        break;
    }
    const mem = process.memoryUsage();
    if (mem.heapUsed / mem.heapTotal > 0.98) {
        console.error('max memory usage reached, allocate more heap memory (--max-old-space-size)');
        break;
    }
} while (!newbest.done);


console.log(best.toString());

// checking for consistency of triangle closing points
const sI = best.scoreInfo;
if (sI.cp) {
    const fixIn = flight.fixes[sI.cp.in.r];
    if (fixIn.latitude !== sI.cp.in.y
        || fixIn.longitude !== sI.cp.in.x) {
        console.warn(`Triangle Flight scoring cp in at point ${sI.cp.in.r} does not match original track data:\r
        ${JSON.stringify(fixIn)}
        ${JSON.stringify(sI.cp.in)}`);


        const latLngMatchIn = flight.fixes.findIndex(f => f.latitude === sI.cp.in.y && f.longitude === sI.cp.in.x)
        console.log(`however gpx fix with index ${latLngMatchIn} matches coordinates of cp.in:\r
          ${JSON.stringify(flight.fixes[latLngMatchIn])}`);
    }


    const fixOut = flight.fixes[sI.cp.out.r];
    if (fixOut.latitude !== sI.cp.out.y
        || fixOut.longitude !== sI.cp.out.x) {
        console.warn(`Triangle Flight scoring cp out point ${sI.cp.out.r} does not match original track data:\r
        ${JSON.stringify(fixOut)}
        ${JSON.stringify(sI.cp.out)}`);

        const latLngMatchOut = flight.fixes.findIndex(f => f.latitude === sI.cp.out.y && f.longitude === sI.cp.out.x)
        console.log(`however gpx fix with index ${latLngMatchOut} matches coordinates of cp.out:\r
          ${JSON.stringify(flight.fixes[latLngMatchOut])}`);
    }

}
