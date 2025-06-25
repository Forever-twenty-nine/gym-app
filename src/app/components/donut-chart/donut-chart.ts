import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'donut-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donut-chart.html',
})
export class DonutChart {
  @Input() data: { label: string; count: number; color: string }[] = [];
  @Input() size = 160;

  get total() {
    return this.data.reduce((sum, d) => sum + d.count, 0);
  }

  get slices() {
    let offset = 25;
    return this.data.map(d => {
      const percent = (d.count / this.total) * 100;
      const slice = {
        dash: `${percent} ${100 - percent}`,
        offset: offset,
        color: d.color
      };
      offset -= percent;
      return slice;
    });
  }
}
