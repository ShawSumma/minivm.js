const readFile = async(name) => {
    if (this.window == null) {
        const fs = require("fs");
        const { promisify } = require("util");
        let buf = await promisify(fs.readFile)(name);
        let arr = new Uint8Array(buf);
        return arr;
    } else {
        let res = await fetch(name).then((data) => data);
        let blob = await res.blob();
        let buf = await blob.arrayBuffer();
        let arr = new Uint8Array(buf);
        return arr;
    }
};

let n = 0;

const inc = function() {
    return n++;
};

OPCODE_EXIT = inc();
OPCODE_STORE_REG = inc();
OPCODE_STORE_LOG = inc();
OPCODE_STORE_NUM = inc();
OPCODE_STORE_FUN = inc();
OPCODE_EQUAL = inc();
OPCODE_EQUAL_NUM = inc();
OPCODE_NOT_EQUAL = inc();
OPCODE_NOT_EQUAL_NUM = inc();
OPCODE_LESS = inc();
OPCODE_LESS_NUM = inc();
OPCODE_GREATER = inc();
OPCODE_GREATER_NUM = inc();
OPCODE_LESS_THAN_EQUAL = inc();
OPCODE_LESS_THAN_EQUAL_NUM = inc();
OPCODE_GREATER_THAN_EQUAL = inc();
OPCODE_GREATER_THAN_EQUAL_NUM = inc();
OPCODE_JUMP_ALWAYS = inc();
OPCODE_JUMP_IF_FALSE = inc();
OPCODE_JUMP_IF_TRUE = inc();
OPCODE_JUMP_IF_EQUAL = inc();
OPCODE_JUMP_IF_EQUAL_NUM = inc();
OPCODE_JUMP_IF_NOT_EQUAL = inc();
OPCODE_JUMP_IF_NOT_EQUAL_NUM = inc();
OPCODE_JUMP_IF_LESS = inc();
OPCODE_JUMP_IF_LESS_NUM = inc();
OPCODE_JUMP_IF_GREATER = inc();
OPCODE_JUMP_IF_GREATER_NUM = inc();
OPCODE_JUMP_IF_LESS_THAN_EQUAL = inc();
OPCODE_JUMP_IF_LESS_THAN_EQUAL_NUM = inc();
OPCODE_JUMP_IF_GREATER_THAN_EQUAL = inc();
OPCODE_JUMP_IF_GREATER_THAN_EQUAL_NUM = inc();
OPCODE_INC = inc();
OPCODE_INC_NUM = inc();
OPCODE_DEC = inc();
OPCODE_DEC_NUM = inc();
OPCODE_ADD = inc();
OPCODE_ADD_NUM = inc();
OPCODE_SUB = inc();
OPCODE_SUB_NUM = inc();
OPCODE_MUL = inc();
OPCODE_MUL_NUM = inc();
OPCODE_DIV = inc();
OPCODE_DIV_NUM = inc();
OPCODE_MOD = inc();
OPCODE_MOD_NUM = inc();
OPCODE_STATIC_CALL = inc();
OPCODE_CALL = inc();
OPCODE_REC = inc();
OPCODE_RETURN = inc();
OPCODE_PRINTLN = inc();
OPCODE_PUTCHAR = inc();
OPCODE_ARRAY = inc();
OPCODE_LENGTH = inc();
OPCODE_INDEX = inc();
OPCODE_INDEX_NUM = inc();
let names = [
    "exit",
    "store_reg",
    "store_log",
    "store_num",
    "store_fun",
    "equal",
    "equal_num",
    "not_equal",
    "not_equal_num",
    "less",
    "less_num",
    "greater",
    "greater_num",
    "less_than_equal",
    "less_than_equal_num",
    "greater_than_equal",
    "greater_than_equal_num",
    "jump_always",
    "jump_if_false",
    "jump_if_true",
    "jump_if_equal",
    "jump_if_equal_num",
    "jump_if_not_equal",
    "jump_if_not_equal_num",
    "jump_if_less",
    "jump_if_less_num",
    "jump_if_greater",
    "jump_if_greater_num",
    "jump_if_less_than_equal",
    "jump_if_less_than_equal_num",
    "jump_if_greater_than_equal",
    "jump_if_greater_than_equal_num",
    "inc",
    "inc_num",
    "dec",
    "dec_num",
    "add",
    "add_num",
    "sub",
    "sub_num",
    "mul",
    "mul_num",
    "div",
    "div_num",
    "mod",
    "mod_num",
    "static_call",
    "call",
    "rec",
    "return",
    "println",
    "putchar",
    "array",
    "length",
    "index",
    "index_num"
];
const read = function(buf, index) {
    return buf[index] + (buf[index + 1] << 8) + (buf[index + 2] << 16) + (buf[index + 3] << 24);
};

const runArray = function(buf) {
    let regs = Array(256).fill(undefined);
    let frames = [256];
    let head = 0;
    let index = 0;
    let func = 0;
    let stdout = "";
    while (true) {
        const op = buf[index];
        // console.log(`${index}: ${names[op]}`);
        index += 1;
        switch (op) {
            case OPCODE_EXIT:
                return 0;
            case OPCODE_STORE_REG:
                {
                    regs[head + read(buf, index)] = regs[head + read(buf, index + 4)];
                    index += 8;
                    break;
                }
            case OPCODE_STORE_LOG:
                {
                    regs[head + read(buf, index)] = buf[index + 4] ? true : false;
                    index += 5;
                    break;
                }
            case OPCODE_STORE_NUM:
                {
                    regs[head + read(buf, index)] = read(buf, index + 4);
                    index += 8;
                    break;
                }
            case OPCODE_STORE_FUN:
                {
                    regs[head + read(buf, index)] = index + 4;
                    index = read(buf, index + 4);
                    break;
                }
            case OPCODE_STATIC_CALL:
                {
                    let outreg = read(buf, index);
                    let next = read(buf, index + 4);
                    let nargs = read(buf, index + 8);
                    index += 12;
                    let oldhead = head;
                    head += frames[frames.length - 1];
                    if (head > regs.length) {
                        regs.length = head * 2;
                    }
                    for (let i = 0; i < nargs; i++) {
                        let val = regs[oldhead + read(buf, index)];
                        if (val === undefined) {
                            throw new Error(`Error: undefined arg: ${index}`);
                        }
                        index += 4;
                        regs[head + i] = val;
                    }
                    frames.push(index);
                    frames.push(func);
                    frames.push(outreg);
                    func = next;
                    index = next;
                    let nregs = read(buf, index);
                    frames.push(oldhead);
                    frames.push(nregs);
                    index += 4;
                    break;
                }
            case OPCODE_REC:
                {
                    let outreg = read(buf, index);
                    let next = func;
                    let nargs = read(buf, index + 4);
                    index += 8;
                    let oldhead = head;
                    head += frames[frames.length - 1];
                    if (head > regs.length) {
                        regs.length = head * 2;
                    }
                    for (let i = 0; i < nargs; i++) {
                        let val = regs[oldhead + read(buf, index)];
                        if (val === undefined) {
                            throw new Error(`Error: undefined arg: ${index}`);
                        }
                        index += 4;
                        regs[head + i] = val;
                    }
                    frames.push(index);
                    frames.push(func);
                    frames.push(outreg);
                    func = next;
                    index = next;
                    let nregs = read(buf, index);
                    frames.push(oldhead);
                    frames.push(nregs);
                    index += 4;
                    break;
                }
            case OPCODE_RETURN:
                {
                    frames.pop();
                    let val = regs[head + read(buf, index)];
                    let newhead = frames.pop();
                    let outreg = frames.pop();
                    func = frames.pop();
                    index = frames.pop();
                    head = newhead;
                    regs[head + outreg] = val;
                    break;
                }
            case OPCODE_EQUAL:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    index += 12;
                    regs[head + out] = lhs === rhs;
                    break;
                }
            case OPCODE_EQUAL_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    index += 12;
                    regs[head + out] = lhs === rhs;
                    break;
                }
            case OPCODE_NOT_EQUAL:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    index += 12;
                    regs[head + out] = lhs !== rhs;
                    break;
                }
            case OPCODE_NOT_EQUAL_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    index += 12;
                    regs[head + out] = lhs !== rhs;
                    break;
                }
            case OPCODE_LESS:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    index += 12;
                    regs[head + out] = lhs < rhs;
                    break;
                }
            case OPCODE_LESS_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    index += 12;
                    regs[head + out] = lhs < rhs;
                    break;
                }
            case OPCODE_GREATER:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    index += 12;
                    regs[head + out] = lhs > rhs;
                    break;
                }
            case OPCODE_GREATER_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    index += 12;
                    regs[head + out] = lhs > rhs;
                    break;
                }
            case OPCODE_LESS_THAN_EQUAL:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    index += 12;
                    regs[head + out] = lhs <= rhs;
                    break;
                }
            case OPCODE_LESS_THAN_EQUAL_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    index += 12;
                    regs[head + out] = lhs <= rhs;
                    break;
                }
            case OPCODE_GREATER_THAN_EQUAL:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    index += 12;
                    regs[head + out] = lhs >= rhs;
                    break;
                }
            case OPCODE_GREATER_THAN_EQUAL_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    index += 12;
                    regs[head + out] = lhs >= rhs;
                    break;
                }
            case OPCODE_JUMP_ALWAYS:
                {
                    let next = read(buf, index);
                    index = next;
                    break;
                }
            case OPCODE_JUMP_IF_FALSE:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    if (lhs) {
                        index += 8;
                    } else {
                        index = read(buf, index);
                    }
                    break;
                }
            case OPCODE_JUMP_IF_TRUE:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    if (lhs) {
                        index = read(buf, index);
                    } else {
                        index += 8;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_LESS:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    if (lhs < rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_EQUAL:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    if (lhs === rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_EQUAL_NUM:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    if (lhs === rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_NOT_EQUAL:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    if (lhs !== rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_NOT_EQUAL_NUM:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    if (lhs !== rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_LESS:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    if (lhs < rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_LESS_NUM:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    if (lhs < rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_GREATER:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    if (lhs > rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_GREATER_NUM:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    if (lhs > rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_LESS_THAN_EQUAL:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    if (lhs <= rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_LESS_THAN_EQUAL_NUM:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    if (lhs <= rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_GREATER_THAN_EQUAL:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    if (lhs >= rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_JUMP_IF_GREATER_THAN_EQUAL_NUM:
                {
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    if (lhs >= rhs) {
                        index = read(buf, index);
                    } else {
                        index += 12;
                    }
                    break;
                }
            case OPCODE_INC:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + out];
                    let rhs = regs[head + read(buf, index + 4)];
                    regs[head + out] = lhs + rhs;
                    index += 8;
                    break;
                }
            case OPCODE_INC_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + out];
                    let rhs = read(buf, index + 4);
                    regs[head + out] = lhs + rhs;
                    index += 8;
                    break;
                }
            case OPCODE_DEC:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + out];
                    let rhs = regs[head + read(buf, index + 4)];
                    regs[head + out] = lhs - rhs;
                    index += 8;
                    break;
                }
            case OPCODE_DEC_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + out];
                    let rhs = read(buf, index + 4);
                    regs[head + out] = lhs - rhs;
                    index += 8;
                    break;
                }
            case OPCODE_ADD:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    regs[head + out] = lhs + rhs;
                    index += 12;
                    break;
                }
            case OPCODE_ADD_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    regs[head + out] = lhs + rhs;
                    index += 12;
                    break;
                }
            case OPCODE_SUB:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    regs[head + out] = lhs - rhs;
                    index += 12;
                    break;
                }
            case OPCODE_SUB_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    regs[head + out] = lhs - rhs;
                    index += 12;
                    break;
                }
            case OPCODE_MUL:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    regs[head + out] = lhs * rhs;
                    index += 12;
                    break;
                }
            case OPCODE_MUL_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    regs[head + out] = lhs * rhs;
                    index += 12;
                    break;
                }
            case OPCODE_DIV:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    regs[head + out] = lhs / rhs;
                    index += 12;
                    break;
                }
            case OPCODE_DIV_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    regs[head + out] = lhs / rhs;
                    index += 12;
                    break;
                }
            case OPCODE_MOD:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = regs[head + read(buf, index + 8)];
                    regs[head + out] = lhs % rhs;
                    index += 12;
                    break;
                }
            case OPCODE_MOD_NUM:
                {
                    let out = read(buf, index);
                    let lhs = regs[head + read(buf, index + 4)];
                    let rhs = read(buf, index + 8);
                    regs[head + out] = lhs % rhs;
                    index += 12;
                    break;
                }
            case OPCODE_PRINTLN:
                {
                    console.log(regs[head + read(buf, index)]);
                    index += 4;
                    break;
                }
            case OPCODE_PUTCHAR:
                {
                    let chr = regs[head + read(buf, index)];
                    if (chr === "\n" || chr === "\r") {
                        console.log(stdout);
                        stdout = "";
                    } else {
                        stdout += String.fromCharCode(chr);
                    }
                    index += 4;
                    break;
                }
            case OPCODE_ARRAY:
                {
                    let out = read(buf, index);
                    let nargs = read(buf, index + 4);
                    index += 8;
                    let arr = [];
                    for (let i = 0; i < nargs; i++) {
                        let elem = regs[head + read(buf, index)];
                        index += 4;
                        arr.push(elem);
                    }
                    regs[head + out] = arr;
                    break;
                }
            case OPCODE_LENGTH:
                {
                    let out = read(buf, index);
                    let val = regs[head + read(buf, index + 4)];
                    index += 8;
                    regs[head + out] = val.length;
                    break;
                }
            case OPCODE_INDEX:
                {
                    let out = read(buf, index);
                    let val = regs[head + read(buf, index + 4)];
                    let ind = regs[head + read(buf, index + 8)];
                    index += 12;
                    regs[head + out] = val[ind];
                    break;
                }
            case OPCODE_INDEX_NUM:
                {
                    let out = read(buf, index);
                    let val = regs[head + read(buf, index + 4)];
                    let ind = read(buf, index + 8);
                    index += 12;
                    regs[head + out] = val[ind];
                    break;
                }
            default:
                console.log(`${index}: ${names[op]}`);
                console.log(`ERROR`);
                return 1;
        }
    }
};

const runFile = async function(name) {
    let buf = await readFile(name);
    return runArray(buf);
};

runFile("tree12.bc");