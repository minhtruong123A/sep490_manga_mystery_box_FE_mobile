const { getDefaultConfig } = require("metro-config");

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();

  return {
    transformer: {
      babelTransformerPath: require.resolve("react-native-svg-transformer")
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== "svg"),
      sourceExts: [...sourceExts, "svg"]
    }
  };
})();


// ----------======= READ ME =======----------
// This config tells Metro (the bundler) how to process '.svg' files like components.
// You can use <Svg /> components anywhere else too (headers, buttons, etc.).

// -------======= How to use =======---------
// import HomeIcon from './assets/icons/home.svg';

// <Tab.Screen
//   name="Home"
//   component={HomeScreen}
//   options={{
//     tabBarIcon: ({ color, size }) => (
//       <HomeIcon width={size} height={size} fill={color} />
//     )
//   }}
// />

// Side note: CSS filters do not work in React Native. 
// For vector icons (e.g., FontAwesome), color change directly 
{/* <FontAwesome name="home" size={24} color={colors.light_1} /> */}
// For custom SVG files must adjust the 'fill' or 'stroke' attributes directly.
{/* <HomeIcon width={100} height={100} fill={colors.light_1} /> */}
