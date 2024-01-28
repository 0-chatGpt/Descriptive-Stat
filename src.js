"use strict";

class Stat {
  constructor(dataset = [], interval = null, freq = null, grouped = false) {
    /***
     * dataset = [1,2,3,4,5,2,23,4,6,...]
     * interval = [[10,15], [20,25], [30,35], ...]
     * freq = [0,2,3,4,21,...]
     *
     */
    this.interval = interval;
    this.grouped = grouped;
    this.freq = freq;
    this.raw = [...dataset];
    this.sum = dataset.reduce((acc, _x, i) => {
      acc = acc + _x;
    }, 0);
    this.midpoints = interval.map((val, i) => (val[0] + val[1]) / 2);
    this.dataset = dataset;
    this.dataset.sort((a, b) => a - b);
  }

  cumFreq() {
    const cumArr = [];
    let sum = 0;
    this.freq.forEach((val) => {
      sum += val;
      cumArr.push(sum);
    });
    return cumArr;
  }

  mean() {
    if (!this.grouped) {
      return this.sum / this.dataset.length;
    } else {
      let sum_f_i = this.freq.reduce((acc, _x) => (acc += _x), 0);
      let sum_m_ixf_i = this.freq.map((val, i) => val * this.midpoints[i]);
      return sum_m_ixf_i / sum_f_i;
    }
  }

  median() {
    if (!this.grouped) {
      if (this.dataset.length % 2 !== 0) {
        return this.dataset[(this.dataset.length + 1) / 2];
      } else {
        return (
          (this.dataset[this.dataset.length / 2] +
            this.dataset[this.dataset.length / 2 + 1]) /
          2
        );
      }
    } else {
      let sum_f_i = this.freq.reduce((acc, _x) => (acc += _x), 0);
      let cum_freq = [0, 0]; // [cumulative, indexofcumulative]
      this.freq.forEach((val, i) => {
        if (!cum_freq[1]) {
          cum_freq[0] += val;
          if (cum_freq[0] >= sum_f_i / 2) {
            cum_freq[1] = i;
          }
        }
      });
      return (
        this.interval[cum_freq[1]][0] +
        ((sum_f_i / 2 - (cum_freq[0] - this.freq[cum_freq[1]])) /
          this.freq[cum_freq[1]]) *
          (this.interval[cum_freq[1]][1] - this.interval[cum_freq[1]][0])
      );
    }
  }

  mode() {
    if (!this.grouped) {
      //Calculate mode of ungrouped population.
    } else {
      let max = Math.max(this.freq);
      let modes = freq
        .map((val, i) => [val, i])
        .filter((val) => val[0] === max);
      let mode_interval = [];
      modes.forEach((val) => mode_interval.push(this.interval[val[1]]));
      return mode_interval.map((val) => val[1] - val[0]);
    }
  }

  range() {
    if (!this.grouped) {
      return Math.max(this.dataset) - Math.min(this.dataset);
    } else {
      let H = this.interval[this.interval.length - 1][1];
      let L = this.interval[0][0];
      return H - L;
    }
  }

  variance() {
    let mean = this.mean();
    if (!this.grouped) {
      let sqr_diff = this.dataset.map((val, i) => {
        return (val - mean) ** 2;
      });
      return (
        (1 / (this.dataset.length - 1)) *
        sqr_diff.reduce((acc, val) => (acc += val), 0)
      );
    } else {
      let sum_f_i = this.freq.reduce((acc, _x) => (acc += _x), 0);
      let sqr_diff_gr = this.interval.map(
        (val) => ((val[0] + val[1]) / 2 - mean) ** 2
      );
      return (
        (1 / (sum_f_i - 1)) *
        this.freq
          .map((val, i) => {
            return val * sqr_diff_gr[i];
          })
          .reduce((acc, val) => (acc += val), 0)
      );
    }
  }

  standardDeviation() {
    let variance = this.variance();
    return variance ** 1 / 2;
  }

  meanDeviation() {
    let mean = this.mean();
    if (!this.grouped) {
      return (
        (1 / this.dataset.length) *
        this.dataset
          .map((val) => Math.abs(val - mean))
          .reduce((acc, val) => (acc += val), 0)
      );
    } else {
      let sum_f_i = this.freq.reduce((acc, val) => (acc += val), 0);
      let diff = this.interval.map((val, i) => {
        return Math.abs(val - mean);
      });
      return (
        (1 / sum_f_i) *
        this.freq
          .map((val, i) => val * diff[i])
          .reduce((acc, val) => (acc += val), 0)
      );
    }
  }

  quartileDevaition() {
    if (!this.grouped) {
      return (
        (this.dataset[(this.dataset.length + 1) / 4] -
          this.dataset[(3 * (this.dataset.length + 1)) / 4]) /
        2
      );
    } else {
      let cumArr = this.cumFreq;
      let cum_freq_1 = [0, 0];
      let cum_freq_2 = [0, 0]; // [cummulative , index]
      let sum_f_i = this.freq.reduce((acc, val) => (acc += val), 0);
      this.freq.forEach((val, i) => {
        if (!cum_freq_1[1]) {
          cum_freq_1[0] += val;
          if (cum_freq_1[0] >= sum_f_i / 4) {
            cum_freq_1[1] = i;
          }
        }
        if (!cum_freq_2[1]) {
          cum_freq_2[0] += val;
          if (cum_freq_2[0] >= (3 * sum_f_i) / 4) {
            cum_freq_2[1] = i;
          }
        }
        return (
          (this.interval[cum_freq_1[1]][0] +
            ((sum_f_i / 4 - cumArr[cum_freq_1[1] - 1]) *
              (this.interval[cum_freq_1[1]][1] -
                this.interval[cum_freq_1[1]][0])) /
              this.freq[cum_freq_1[1]] -
            (this.interval[cum_freq_2[1]][0] +
              (((3 * sum_f_i) / 4 - cumArr[cum_freq_2[1] - 1]) *
                (this.interval[cum_freq_2[1]][1] -
                  this.interval[cum_freq_2[1]][0])) /
                this.freq[cum_freq_2[1]])) /
          2
        );
      });
    }
  }
}
