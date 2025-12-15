import s from './App.module.scss';

const App: React.FC = () => {
  return (
    <div className={s.root} data-testid="app-root">
      <h1>Landing-Box</h1>
      <p>Стартовый каркас работает ✅</p>
    </div>
  );
};

export default App;
