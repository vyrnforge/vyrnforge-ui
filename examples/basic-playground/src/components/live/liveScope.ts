import * as React from "react";
import {
  AppShell,
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  DateInput,
  DateTimeInput,
  Field,
  Heading,
  Icon,
  IconButton,
  Inline,
  Panel,
  NumberInput,
  Radio,
  RadioGroup,
  SearchInput,
  SegmentedControl,
  Select,
  SideNav,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Textarea,
  ToolbarButton,
  TopNav,
  ValidationMessage
} from "@dravyn/ui-components";
import { UniversalDataGrid } from "@dravyn/ui-data-grid";

export const liveScope = {
  React,
  AppShell,
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  DateInput,
  DateTimeInput,
  Field,
  Heading,
  Icon,
  IconButton,
  Inline,
  Panel,
  NumberInput,
  Radio,
  RadioGroup,
  SearchInput,
  SegmentedControl,
  Select,
  SideNav,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Textarea,
  ToolbarButton,
  TopNav,
  ValidationMessage,
  UniversalDataGrid
};

export function createLiveScope(...keys: Array<keyof typeof liveScope>) {
  return keys.reduce<Record<string, unknown>>((scope, key) => {
    scope[key] = liveScope[key];
    return scope;
  }, {});
}
