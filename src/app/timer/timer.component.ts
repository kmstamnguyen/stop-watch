import { AfterContentInit, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { map, mapTo, scan, startWith, switchMap, tap } from 'rxjs/operators';
import { fromEvent, merge, interval, NEVER, of, BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent implements AfterViewInit {

  timer = '00:00:00';
  startText = 'START';

  @ViewChild('start', { static: false })
  startBtn: ElementRef;

  @ViewChild('reset', { static: true })
  resetBtn: ElementRef;


  transform(value: number): string {
    const hours = Math.floor((value / 60) / 60);
    const minutes = Math.floor(value / 60) % 60;
    const seconds = value % 60;
    return `${this.padding(hours)}${hours}:${this.padding(minutes)}${minutes}:${this.padding(seconds)}${seconds}`;
  }

  padding(time): string {
    return time < 10 ? '0' : '';
  }

  ngAfterViewInit(): void {
    const events$ =
    merge(
      fromEvent(this.startBtn.nativeElement, 'click').pipe(mapTo({ running: true })),
      fromEvent(this.resetBtn.nativeElement, 'click').pipe(mapTo({ value: 0, running: false  }))
    );

    const stopWatch$ = events$.pipe(
      startWith({ running: false, value: 0 }),
      scan((accumulatedValue, currentValue) => {
        if (currentValue.running){
          if (this.startText === 'PAUSE') { return ({...accumulatedValue, ...currentValue, running: false}); }
          if (this.startText === 'RESUME') { return ({...accumulatedValue, ...currentValue, running: true}); }
        }
        return ({...accumulatedValue, ...currentValue});
      }),
      tap((state: State) => {
        this.timer =  this.transform(state.value);
      }),
      switchMap((state: State) => state.running
        ? interval(1000)
          .pipe(
            tap(_ => {
              state.value += 1;
            }),
            tap(_ => {
              this.timer =  this.transform(state.value);
              this.startText = 'PAUSE';
            }
            )
          )
        : of(null).pipe(tap(_ => {
          if (this.timer !== '00:00:00'){
            this.startText = 'RESUME';
          }else{
            this.startText = 'START';
          }
        })))
    );
    stopWatch$.subscribe();
  }
}


interface State {
  running: boolean;
  value: number;
}
