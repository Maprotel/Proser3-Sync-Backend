export function removeRowDataPacket(myResult: any) {
  let result = myResult;

  if (myResult) {
    result = JSON.parse(JSON.stringify(myResult));
  }

  return result;
}

export function removeRowDataPacketArray(myResult: any) {
  let result = myResult;

  if (myResult) {
    result = myResult
      .map((x: any) => {
        return x.RowDataPacket;
      });
  }

  return result;
}
