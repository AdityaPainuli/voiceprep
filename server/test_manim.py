from manim import *

class TestScene(Scene):
    def construct(self):
        c = Circle()
        self.play(Create(c))
