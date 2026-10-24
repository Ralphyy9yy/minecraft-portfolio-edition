import React from 'react';

interface Props {
  children: React.ReactNode;
  onBack: () => void;
}

export class ScreenErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div role="alert" className="screen-fallback">
        <h1 tabIndex={-1}>This screen could not load.</h1>
        <p className="reading-text">Check your connection and try opening it again.</p>
        <button className="minecraft-button h-12 px-6" onClick={this.props.onBack}>Back to Main Menu</button>
      </div>
    );
  }
}
