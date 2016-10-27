import React, { Component, PropTypes } from "react";

import { ldBrowserInit } from "../lib/launchDarkly";

export default class FeatureFlag extends Component {
  static propTypes = {
    flagKey: PropTypes.string.isRequired,
    renderFeatureCallback: PropTypes.func.isRequired,
    renderDefaultCallback: PropTypes.func,
    initialRenderCallback: PropTypes.func
  };

  constructor (props) {
    super(props);

    this.state = {
      checkFeatureFlagComplete: false,
      showFeature: false
    };
  }

  componentDidMount () {
    this._checkFeatureFlag();
  }

  render () {
    return (
      <div data-qa={`FeatureFlag-${this.props.flagKey}`}>{ this._renderLogic() }</div>
    );
  }

  _renderLogic () {
    const { showFeature, checkFeatureFlagComplete } = this.state;
    const { renderFeatureCallback, renderDefaultCallback, initialRenderCallback } = this.props;

    if (showFeature) {
      return renderFeatureCallback();
    } else if (checkFeatureFlagComplete && renderDefaultCallback) {
      return renderDefaultCallback();
    }

    if (initialRenderCallback) {
      return initialRenderCallback();
    }

    return null;
  }

  _checkFeatureFlag () {
    // @TODO: determine best way to pass api key and user
    const ldClient = ldBrowserInit("api-key", "user");
    const { flagKey } = this.props;

    ldClient.on("ready", () => {
      const showFeature = ldClient.variation(flagKey, false);
      const defaultState = { checkFeatureFlagComplete: true };

      if (showFeature) {
        this.setState({ showFeature: true, ...defaultState });
      } else {
        this.setState({ showFeature: false, ...defaultState });
      }
    });
  }
}
