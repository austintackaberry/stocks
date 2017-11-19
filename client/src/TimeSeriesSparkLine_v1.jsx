import React from 'react';

type Props = {
  data: any,
  height: number,
  selectX: (datum: any) => any,
  selectY: (datum: any) => any,
  width: number,
};

export default ({
  data,
  height,
  selectX,
  selectY,
  width,
}: Props => (
  <svg
    className="container"
    height={height}
    width={width}
>

</svg>
))
