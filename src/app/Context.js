import React, { createContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import data from "../db/content.json";

export const Context = createContext();

const Index = ({ children }) => {
  const [filterData, setFilterData] = useState([]);
  const [isActiveId, setIsActiveId] = useState();
  const [modal, setModal] = useState({
    toggle: false,
    modalObj: null,
    operation: "",
  });
  const [count, setCount] = useState("init");
  const [mathCount, setMathCount] = useState({
    serialIndex: 0,
    finalMath: null,
  });
  const [answare, setAnswer] = useState([]);
  const sessionLocal = localStorage.getItem("session");
  const [overallScore, setOverallScore] = useState({
    exactScore: 0,
    percentScore: 0,
    timeSpent: 0,
    currectAnswer: 0,
    wrongAnswer: 0,
  });

  useEffect(() => {
    if (answare.length === mathCount.serialIndex + 1) {
      let score = 0;
      answare.forEach((el) => {
        if (el.isCurrect) {
          score++;
        }
      });
      let miliSecond = 0;
      answare.forEach((el) => {
        miliSecond = miliSecond + el.miliSecond;
      });
      setOverallScore({
        exactScore: score,
        percentScore: (100 / answare.length) * score,
        timeSpent: miliSecond / 1000,
        currectAnswer: score,
        wrongAnswer: answare.length - score,
      });
    }
  }, [answare, mathCount.serialIndex]);

  const onChangeHanlder = (id) => {
    const temp = [...filterData];
    const findIndex = temp.findIndex((el) => el._id === id);
    const findTrue = temp.findIndex((el) => el.isActive === true);
    const findData = temp[findIndex];
    const findData2 = temp[findTrue];
    if (findData.isActive !== "disable") {
      temp[findData] = findData.isActive = true;
      if (findData2) {
        temp[findData2] = findData2.isActive = false;
      }
      setFilterData(temp);
      setIsActiveId(id);
      localStorage.setItem("filterId", id);
    }
  };

  useEffect(() => {
    const temp = data.filter.items;
    const findTrue = temp.find((el) => el.isActive === true);
    const localId = Number(localStorage.getItem("filterId"));
    if (localId) {
      const findTrue = temp.findIndex((el) => el.isActive === true);
      const findData2 = temp[findTrue];
      if (findData2) {
        temp[findData2] = findData2.isActive = false;
      }
      const findIndex = temp.findIndex((el) => el._id === localId);
      const findData = temp[findIndex];
      temp[findData] = findData.isActive = true;
      setIsActiveId(localId);
    } else {
      setIsActiveId(findTrue._id);
    }
    setFilterData(temp);
  }, []);

  const modalHandler = (obj, operation) => {
    setModal({
      toggle: !modal.toggle,
      modalObj: obj,
      operation: operation,
    });
    setCount("init");
    setAnswer([]);
  };

  const getStartedHandler = () => {
    setCount("start");
    questionGenerator();
  };

  const countFinishHandler = () => {
    setCount("finish");
  };

  const mathCountHandler = (ansObj) => {
    const temp = [...answare];
    if (mathCount.serialIndex + 1 < mathCount.finalMath.math.length) {
      setMathCount({
        ...mathCount,
        serialIndex: mathCount.serialIndex + 1,
      });
    } else {
      setTimeout(() => {
        setCount("mathdone");
      }, 2000);
    }
    ansObj.sessionID = sessionLocal;
    temp.push(ansObj);
    setAnswer(temp);
  };

  const doitagainHandler = () => {
    setCount("start");
    setAnswer([]);
    questionGenerator();
  };

  const questionGenerator = () => {
    const mathTemp = {
      configuration: "horizontal",
      math: [],
    };
    for (let i = 1; i <= data.math.totalQuestions; i++) {
      const number = modal.modalObj.number;
      let firstDigit, secondDigit, temp;
      if (modal.operation === "+") {
        firstDigit = Math.floor(Math.random() * number);
        secondDigit = Math.floor(Math.random() * (number - firstDigit));
        temp = firstDigit + secondDigit;
      } else if (modal.operation === "-") {
        firstDigit = Math.floor(Math.random() * number);
        secondDigit = Math.floor(Math.random() * (firstDigit + 1));
        temp = firstDigit - secondDigit;
      } else if (modal.operation === "*") {
        firstDigit = Math.floor(Math.random() * number);
        secondDigit = Math.floor(Math.random() * number);
        temp = firstDigit * secondDigit;
      } else if (modal.operation === "÷") {
        secondDigit = Math.floor(Math.random() * (number - 1)) + 1;
        firstDigit = Math.floor(Math.random() * (number / secondDigit)) * secondDigit;
        temp = firstDigit / secondDigit;
      }
      const mathObj = {
        _id: `q${i}`,
        firstNumber: firstDigit,
        secondNumber: secondDigit,
        currectAnsware: String(temp),
        oparation: modal.operation,
      };
      mathTemp.math.push(mathObj);
    }
    setMathCount({
      serialIndex: 0,
      finalMath: mathTemp,
    });
  };
  

  useEffect(() => {
    if (!sessionLocal) {
      const sessionId = uuidv4();
      localStorage.setItem("session", sessionId);
    }
  }, [sessionLocal]);

  return (
    <Context.Provider
      value={{
        data: data,
        math: data.math,
        filterData: filterData,
        isActiveId: isActiveId,
        modal: modal,
        count: count,
        mathCount: mathCount,
        answare: answare,
        overallScore: overallScore,
        onChangeHanlder: onChangeHanlder,
        modalHandler: modalHandler,
        getStartedHandler: getStartedHandler,
        countFinishHandler: countFinishHandler,
        mathCountHandler: mathCountHandler,
        doitagainHandler: doitagainHandler,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default Index;
