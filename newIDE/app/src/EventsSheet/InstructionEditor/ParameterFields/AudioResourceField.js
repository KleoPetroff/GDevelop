// @flow
import React, { Component } from 'react';
import ResourceSelector from '../../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../../ResourcesLoader';
import { type ParameterFieldProps } from './ParameterFieldProps.flow';

export default class AudioResourceField extends Component<
  ParameterFieldProps,
  void
> {
  _field: ?ResourceSelector;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    if (
      !this.props.resourceSources ||
      !this.props.onChooseResource ||
      !this.props.resourceExternalEditors
    ) {
      console.error(
        'Missing resourceSources, onChooseResource or resourceExternalEditors for AudioResourceField'
      );
      return null;
    }

    return (
      <ResourceSelector
        project={this.props.project}
        resourceSources={this.props.resourceSources}
        onChooseResource={this.props.onChooseResource}
        resourceExternalEditors={this.props.resourceExternalEditors}
        resourcesLoader={ResourcesLoader}
        resourceKind="audio"
        fullWidth
        initialResourceName={this.props.value}
        onChange={this.props.onChange}
        floatingLabelText="Choose the audio file to use"
        ref={field => this._field = field}
      />
    );
  }
}
