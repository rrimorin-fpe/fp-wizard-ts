import React, {
    Children,
    createContext,
    useContext,
    useReducer,
    useCallback,
    ReactNode,
    useMemo,
    useEffect,
  } from 'react';

  import './Wizard.css';
  
  interface WizardStepperReducerState {
    activeStepIndex: number;
    steps: DefaultWizardStepProps[];
  }
  
  type Action =
    | { type: 'NEXT_PAGE' }
    | { type: 'PREV_PAGE' }
    | { type: 'GOTO_PAGE'; payload: { stepId: number } }
    | {
        type: 'SET_STEP_COUNT';
        payload: { steps: DefaultWizardStepProps[] };
      };
  
  export interface DefaultWizardStepProps {
    id: number | string;
    title: string;
  }
  
  interface WizardStepperContextProps<T = DefaultWizardStepProps> {
    activeStepIndex: number;
    steps: T[];
    isFirstStep: boolean;
    isLastStep: boolean;
    goTo: (id: number | string) => void;
    onNext: (cb?: () => void) => void;
    getActiveStep: () => T;
    onPrevious: () => void;
    setSteps: (steps: T[] | T) => void;
  }
  
  const initialState: WizardStepperReducerState = {
    activeStepIndex: 0,
    steps: [],
  };
  
  const WizardStepperContext = createContext({});
  
  WizardStepperContext.displayName = 'WizardStepperContext';
  
  export const useWizardContext = <T, _P = never>() => {
    const context = useContext(WizardStepperContext);
    if (Object.keys(context).length === 0) {
      throw new Error(
        `Please make sure you're wrapping all the steps in a 'WizardProvider' component`
      );
    }
    return context as Readonly<WizardStepperContextProps<T>>;
  };
  
  const reducer = (
    state: WizardStepperReducerState,
    action: Action
  ): WizardStepperReducerState => {
    const { steps, activeStepIndex } = state;
  
    switch (action.type) {
      case 'NEXT_PAGE':
        const newIndex = activeStepIndex + 1;
        if (newIndex < steps.length) {
          return { ...state, activeStepIndex: newIndex };
        }
        return state;
      case 'PREV_PAGE':
        if (activeStepIndex > 0) {
          return { ...state, activeStepIndex: activeStepIndex - 1 };
        }
        return state;
  
      case 'GOTO_PAGE':
        const { stepId } = action.payload;
        if (activeStepIndex !== stepId && stepId < steps.length && stepId >= 0) {
          return { ...state, activeStepIndex: stepId };
        }
        return state;
      case 'SET_STEP_COUNT':
        const { steps: newSteps } = action.payload;
        return { ...state, steps: newSteps };
      default:
        return state;
    }
  };
  
  export const WizardProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
  
    const { activeStepIndex, steps } = state;
  
    const onNext = useCallback(
      async (cb?: () => void) => {
        if (typeof cb === 'function') {
          await cb();
        }
        dispatch({ type: 'NEXT_PAGE' });
      },
      [dispatch]
    );

    const onPrevious = useCallback(() => {
      dispatch({ type: 'PREV_PAGE' });
    }, [dispatch]);
  
    const setSteps = useCallback(
      (steps: DefaultWizardStepProps[]) => {
        dispatch({ type: 'SET_STEP_COUNT', payload: { steps } });
      },
      [dispatch]
    );
  
    const goTo = useCallback(
      (stepId: number) => {
        dispatch({ type: 'GOTO_PAGE', payload: { stepId } });
      },
      [dispatch]
    );
  
    const getActiveStep = useCallback(
      () => steps[activeStepIndex],
      [activeStepIndex, steps]
    );
  
    const context = useMemo(
      () => ({
        activeStepIndex,
        steps,
        goTo,
        onNext,
        onPrevious,
        setSteps,
        getActiveStep,
        isFirstStep: activeStepIndex === 0,
        isLastStep: activeStepIndex >= steps.length - 1,
      }),
      [activeStepIndex, steps, goTo, onNext, onPrevious, setSteps, getActiveStep]
    );
  
    return (
      <WizardStepperContext.Provider value={context}>
        {children}
      </WizardStepperContext.Provider>
    );
  };
  
  interface StepsProps {
    children: JSX.Element | JSX.Element[];
  }
  
  export const Steps = ({ children }: StepsProps) => {
    const reactChildren = Children.toArray(children);
    if (reactChildren.length === 0) {
      throw new Error('Steps should have at least a single child component');
    }
  
    const index = reactChildren.findIndex(
      child => (child as JSX.Element).type !== Step
    );
  
    if (index !== -1) {
      throw new Error(
        `Error at position "${index}". You should compose Steps using "Step" component`
      );
    }
  
    const { activeStepIndex, setSteps, steps } =
      useWizardContext<DefaultWizardStepProps>();
  
    useEffect(() => {
      if (steps.length !== reactChildren.length) {
        setSteps(
          reactChildren.map((child: any) => ({
            id: (child as JSX.Element).props.id,
            title: (child as JSX.Element).props.title,
          }))
        );
      }
    }, [setSteps, steps, reactChildren]);
  
    return reactChildren[activeStepIndex] as JSX.Element;
  };
  
  interface StepProps {
    id: string;
    title: string;
    children: ReactNode | JSX.Element | JSX.Element[];
  }
  
  export const Step = ({ id, children }: StepProps) => (
    <div id={id}>{children}</div>
  );

  const Footer = () => {
    const { activeStepIndex, onNext, onPrevious, goTo, isFirstStep, isLastStep, steps } =
      useWizardContext<DefaultWizardStepProps>();
    
    return (
      <div className='fp-c-wizard__footer'>
        <button onClick={onPrevious} disabled={isFirstStep}>
          Previous
        </button>
        <button
          onClick={useCallback(() => {
            onNext();
          }, [goTo, onNext, activeStepIndex])}
          disabled={isLastStep}
        >
          Next
        </button>
      </div>
    );
  };

  const Progress = () => {
    const { activeStepIndex, steps } = useWizardContext<DefaultWizardStepProps>();
  
    return (
      <div>
        State {activeStepIndex + 1} of {steps.length}
      </div>
    );
  };

  const Navbar = () => {
    const { steps, getActiveStep } = useWizardContext<DefaultWizardStepProps>();
    const activeStep = getActiveStep();
    return (
      <nav className='fp-c-wizard__nav'>
        <ol className='fp-c-wizard__nav-list'>
          {
            steps.map((step) => (
              <li key={step.id} className='fp-c-wizard__nav-item'>
                <button className={`fp-c-wizard__nav-link ${activeStep.id === step.id ? 'fp-c-wizard__nav-link-active' : ''}`}>
                  {step.title}
                </button>
              </li>)
            )
          }
        </ol>
      </nav>
    )
  }

  export const Wizard = ({ children }: StepsProps) => {
    return (
      <WizardProvider>
        <div className='fp-c-wizard'>
          <div className='fp-c-wizard__outer-wrap'>
            <div className='fp-c-wizard__inner-wrap'>
              <Navbar />
              <div className='fp-c-wizard__main'>
                <div className='fp-c-wizard__main-body'>
                  { children }
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </WizardProvider>
    );
  };
