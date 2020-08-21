import React from "react";
import ReactDOM from "react-dom";

// 여기 이 두 컨테이너는 DOM에서 형제 관계입니다.
const appRoot = document.getElementById("app-root");
const modalRoot = document.getElementById("modal-root");

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.el = document.createElement("div");
  }

  componentDidMount() {
    // Portal 엘리먼트는 Modal의 자식이 마운트된 후 DOM 트리에 삽입됩니다.
    // 요컨대, 자식은 어디에도 연결되지 않은 DOM 노드로 마운트됩니다.
    // 만약 자식 컴포넌트가 마운트될 때 그것을 즉시 DOM 트리에 연결해야만 한다면,
    // 예를 들어, DOM 노드를 계산한다든지 자식 노드에서 'autoFocus'를 사용한다든지 하는 경우에,
    // Modal에 state를 추가하고 Modal이 DOM 트리에 삽입되어 있을 때만 자식을 렌더링하십시오.
    modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el);
  }
}
class Parent extends React.Component {
  ref = React.createRef();

  constructor(props) {
    super(props);
    this.state = { clicks: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    // 이것은 Child에 있는 버튼이 클릭 되었을 때 발생하고 Parent의 state를 갱신합니다.
    // 비록 버튼이 DOM 상에서 직계 자식이 아니라고 하더라도 말입니다.
    this.setState((state) => ({
      clicks: state.clicks + 1
    }));
  }

  // 중요! 등록하지만, Portal의 이벤트가 전달되지는 않는다.
  // SyntheticEvent로 관리되지 않는 NativeEvent이기 때문.
  componentDidMount() {
    // this.ref.current는 DOM 객체이므로 onClick 속성이 없다.
    // 더불어, onclick은 NativeEvent이므로 SyntheticEvent로 관리되지 않는다.
    // this.ref.current.onClick(() => this.handleClick);
    this.ref.current.addEventListener("click", this.handleClick);
  }

  componentWillUnmount() {
    this.ref.current.removeEventListener("click", this.handleClick);
  }

  render() {
    return (
      <div ref={this.ref} onClick={this.handleClick}>
        <p>Number of clicks: {this.state.clicks}</p>
        <p>
          Open up the browser DevTools to observe that the button is not a child
          of the div with the onClick handler.
        </p>
        <Modal>
          <Child />
        </Modal>
      </div>
    );
  }
}

function Child() {
  // 이 버튼에서의 클릭 이벤트는 부모로 버블링됩니다.
  // 왜냐하면 'onClick' 속성이 정의되지 않았기 때문입니다.

  return (
    <div className="modal">
      <button
        onClick={(event) => {
          // 동일한 SyntheticEvent에 속한 함수의 실행만 방지한다.
          // event.stopPropagation();
          console.log("button clicked");
        }}
      >
        Click
      </button>
    </div>
  );
}
ReactDOM.render(<Parent />, appRoot);
