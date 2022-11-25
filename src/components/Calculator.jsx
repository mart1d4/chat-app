import { useState, useEffect } from 'react';
import styles from './calculator.module.css';
import calculateFromArray from '../utils/calculateFromArray';

const secondaryButtons = [
    '√', 'π', '^', '!',
    'DEG', 'sin', 'cos', 'tan',
    'INV', 'e', 'ln', 'log',
];

const primaryButtons = [
    'AC', '( )', '%', '÷',
    '7', '8', '9', '×',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '·', 'd', '='
];

const operators = ['+', '-', '*', '×', '/', '÷', '^', '%', '( )', '√', '!', 'π', 'e', 'ln', 'log', 'sin', 'cos', 'tan'];

const Calculator = () => {
    const [displayOtherSecondaryButtons, setDisplayOtherSecondaryButtons] = useState(false);
    const [string, setString] = useState('');
    const [result, setResult] = useState('');

    const handleButtonClick = (button) => {
        if (button === 'AC') {
            setString('');
            setResult('');
        } else if (button === '=') {
            setString(result.toString());
            setResult('');
        } else if (button === 'd') {
            setString(string.slice(0, -1));
        } else {
            setString(string + button);
        }
    }

    const hasOne = (string) => {
        const array = string.split('');
        return array.some((item) => operators.includes(item));
    }

    useEffect(() => {
        if (string && !operators.includes(string[string.length - 1]) && hasOne(string)) {
            const newString = string.replace(/×/g, '*').replace(/÷/g, '/').replace(/·/g, '.');
            const array = newString.split(/([+\-%*/^()])/);
            
            const newArray = array.map((item) => {
                if (!operators.includes(item)) {
                    return Number(item);
                }
                return item;
            });
            
            const result = calculateFromArray(newArray);
            setResult(result);
        }
    }, [string]);

    return (
        <div
            className={styles.container}
        >
            <div
                className={styles.display}
            >
                <div
                    className={styles.displaySettings}
                >
                    <button>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className={styles.settingsIcon}
                        >
                            <path d='M12 19.275q-.625 0-1.062-.438-.438-.437-.438-1.062t.438-1.063q.437-.437 1.062-.437t1.062.437q.438.438.438 1.063t-.438 1.062q-.437.438-1.062.438Zm0-5.775q-.625 0-1.062-.438Q10.5 12.625 10.5 12t.438-1.062Q11.375 10.5 12 10.5t1.062.438q.438.437.438 1.062t-.438 1.062q-.437.438-1.062.438Zm0-5.775q-.625 0-1.062-.438-.438-.437-.438-1.062t.438-1.063q.437-.437 1.062-.437t1.062.437q.438.438.438 1.063t-.438 1.062q-.437.438-1.062.438Z'/>
                        </svg>
                    </button>
                </div>

                <input
                    type='text'
                    className={styles.displayString}
                    value={string}
                    onChange={(e) => setString(prev => prev + e.target.value)}
                />
                
                <div
                    className={styles.displayResult}
                >
                    {
                        isNaN(result) || result === Infinity || result === -Infinity
                            ? ''
                            : result.toLocaleString()
                    }
                </div>
            </div>

            <div
                className={
                    !displayOtherSecondaryButtons
                        ? styles.secondaryButtons
                        : styles.secondaryButtonsExtended
                }
            >
                <div
                    className={
                        !displayOtherSecondaryButtons
                            ? styles.secondaryButtonsGrid
                            : styles.secondaryButtonsGridExtended
                    }
                >
                    {secondaryButtons.map((button, index) => (
                        <button
                            key={index}
                            className={
                                !displayOtherSecondaryButtons
                                    ? index > 3 ? styles.secondaryButtonHidden : styles.secondaryButton
                                    : styles.secondaryButton
                            }
                        >
                            {button}
                        </button>
                    ))}
                </div>

                <button
                    className={styles.dropDownButton}
                    onClick={() => setDisplayOtherSecondaryButtons(prev => !prev)}
                >
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className={styles.dropDownIcon}
                    >
                        <path d='M12 14.375q-.15 0-.287-.05-.138-.05-.288-.2L7.05 9.75q-.175-.175-.175-.363 0-.187.175-.337.15-.175.35-.175.2 0 .35.175L12 13.275l4.25-4.25q.15-.15.35-.15.2 0 .35.175.175.15.175.35 0 .2-.175.35l-4.375 4.375q-.15.15-.287.2-.138.05-.288.05Z' />
                    </svg>
                </button>
            </div>

            <div
                className={
                    !displayOtherSecondaryButtons
                        ? styles.primaryButtons
                        : styles.primaryButtonsShrink
                }
            >
                {primaryButtons.map((button, index) => (
                    <button
                        key={index}
                        className={
                            operators.includes(button)
                                ? styles.primaryButtonOperator
                                : button === 'AC' || button === '='
                                    ? styles.primaryButtonClear
                                    : styles.primaryButton
                        }
                        onClick={() => handleButtonClick(button)}
                    >
                        {button}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Calculator