const calculateFromArray = (array) => {
    const calculateByTwo = (operator1, operator2) => {
        while (array.includes(operator1) || array.includes(operator2)) {
            const index =
                array.indexOf(operator1) !== -1
                    ? array.indexOf(operator1)
                    : array.indexOf(operator2);
            operator1 === '%'
                ? array.splice(
                      index - 1,
                      3,
                      array.indexOf(operator1) !== -1
                          ? (array[index - 1] / 100) * array[index + 1]
                          : Math.pow(array[index - 1], array[index + 1])
                  )
                : operator1 === '/'
                ? array.splice(
                      index - 1,
                      3,
                      array.indexOf(operator1) !== -1
                          ? array[index - 1] / array[index + 1]
                          : array[index - 1] * array[index + 1]
                  )
                : array.splice(
                      index - 1,
                      3,
                      array.indexOf(operator1) !== -1
                          ? array[index - 1] - array[index + 1]
                          : array[index - 1] + array[index + 1]
                  );
        }
    };

    calculateByTwo('%', '^');
    calculateByTwo('/', '*');
    calculateByTwo('-', '+');

    return array[0];
};

export default calculateFromArray;
